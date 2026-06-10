import { execute, queryAll, queryFirst } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";
import {
  appendLocalVote,
  getLocalCandidatesState,
  getLocalRolesState
} from "@/lib/election/local-store";
import { getElectionStatus } from "@/lib/election/election-service";
import { serializeCompletedRoles } from "@/lib/election/session";
import { voteSubmissionSchema } from "@/lib/validation";

type BallotRole = {
  id: string;
  name: string;
  description: string;
  display_order: number;
  status: "Active" | "Inactive";
  is_class_leader: boolean;
  class_id: string | null;
  division_id: string | null;
  candidates: {
    id: string;
    name: string;
    class_name: string;
    class_id: string;
    division_id: string;
    photo_url: string;
    status: "Active" | "Inactive";
  }[];
};

type BallotRoleBase = Omit<BallotRole, "candidates">;

function hasDatabaseBinding() {
  return Boolean(getBindings().DB);
}

export async function getBallotRoles() {
  const election = await getElectionStatusWithScope();
  const scopeType = election?.scope_type ?? "SCHOOL";

  if (!hasDatabaseBinding()) {
    const roles = (await getLocalRolesState()).filter((role) => role.status === "Active");
    const candidates = (await getLocalCandidatesState()).filter(
      (candidate) => candidate.status === "Active"
    );

    const visibleRoles =
      scopeType === "CLASS"
        ? roles.filter((role) => role.is_class_leader)
        : roles.filter((role) => !role.is_class_leader);

    return visibleRoles.map((role) => {
      const baseRole: BallotRoleBase = {
        id: role.id,
        name: role.name,
        description: role.description,
        display_order: role.display_order,
        status: role.status,
        is_class_leader: role.is_class_leader,
        class_id: null,
        division_id: null
      };

      return {
        ...baseRole,
        candidates: candidates.filter((candidate) => candidate.role_id === role.id).map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          class_name: candidate.class_name,
          class_id: candidate.class_id,
          division_id: candidate.division_id,
          photo_url: candidate.photo_url,
          status: candidate.status
        }))
      };
    });
  }

  const roles = await queryAll<{
    id: string;
    name: string;
    description: string;
    display_order: number;
    status: "Active" | "Inactive";
    is_class_leader: number;
    class_id: string | null;
    division_id: string | null;
  }>(
    getBindings(),
    `SELECT id, name, description, display_order, status, is_class_leader, class_id, division_id
     FROM roles
     WHERE status = 'Active'
     ORDER BY display_order ASC;`
  );

  const candidates = await queryAll<{
    id: string;
    role_id: string;
    name: string;
    class_name: string;
    class_id: string;
    division_id: string;
    photo_url: string;
    status: "Active" | "Inactive";
  }>(
    getBindings(),
    `SELECT id, role_id, name, class_name, class_id, division_id, photo_url, status
     FROM candidates
     WHERE status = 'Active'
     ORDER BY created_at ASC;`
  );

  const filteredRoles =
    scopeType === "CLASS"
      ? roles.filter((role) => Boolean(role.is_class_leader))
      : roles.filter((role) => !Boolean(role.is_class_leader));

  return filteredRoles.map((role) => ({
    ...role,
    candidates: candidates.filter((candidate) => candidate.role_id === role.id)
  }));
}

async function getElectionStatusWithScope() {
  if (!hasDatabaseBinding()) {
    return null;
  }

  return queryFirst<{
    scope_type: "SCHOOL" | "CLASS";
    class_id: string | null;
    division_id: string | null;
  }>(
    getBindings(),
    `SELECT scope_type, class_id, division_id
     FROM elections
     WHERE id = ?;`,
    ["default-election"]
  );
}

export async function getVotingPortalState(sessionKey: string) {
  const electionStatus = await getElectionStatus();
  const roles = await getBallotRoles();
  const completedRoleIds = await getCompletedRoleIds(sessionKey);
  const nextRole =
    roles.find((role) => !completedRoleIds.includes(role.id)) ?? null;
  const hasReadyBallot = roles.some((role) => role.candidates.length > 0);
  const effectiveElectionStatus =
    hasReadyBallot ? electionStatus : "CLOSED";

  return {
    electionStatus: effectiveElectionStatus,
    configuredElectionStatus: electionStatus,
    hasReadyBallot,
    roles,
    completedRoleIds,
    nextRole,
    isComplete: hasReadyBallot && nextRole === null && roles.length > 0
  };
}

export async function getCompletedRoleIds(sessionKey: string) {
  if (!hasDatabaseBinding()) {
    return [];
  }

  const session = await queryFirst<{ completed_role_ids_json: string }>(
    getBindings(),
    `SELECT completed_role_ids_json
     FROM vote_sessions
     WHERE session_key = ?;`,
    [sessionKey]
  );

  if (!session?.completed_role_ids_json) {
    return [];
  }

  try {
    const parsed = JSON.parse(session.completed_role_ids_json);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export async function submitRoleVote(
  sessionKey: string,
  payload: unknown,
  completedRoleIdsFromCookie: string[]
) {
  const parsed = voteSubmissionSchema.parse(payload);
  const electionStatus = await getElectionStatus();
  const roles = await getBallotRoles();

  if (!roles.some((role) => role.candidates.length > 0)) {
    throw new Error(
      "Voting is closed until an administrator adds candidate details and opens the ballot."
    );
  }

  if (electionStatus !== "OPEN") {
    throw new Error("Voting is not open.");
  }

  const role = roles.find((item) => item.id === parsed.role_id);

  if (!role) {
    throw new Error("Role is invalid or inactive.");
  }

  const candidate = role.candidates.find(
    (item) => item.id === parsed.candidate_id
  );

  if (!candidate) {
    throw new Error("Candidate is invalid, inactive, or does not belong to the role.");
  }

  if (role.is_class_leader) {
    const candidateClassMatches = !role.class_id || candidate.class_id === role.class_id;
    const candidateDivisionMatches =
      !role.division_id || candidate.division_id === role.division_id;

    if (!candidateClassMatches || !candidateDivisionMatches) {
      throw new Error("Candidate does not belong to the selected class leader election.");
    }
  }

  const completedRoleIds = hasDatabaseBinding()
    ? await getCompletedRoleIds(sessionKey)
    : completedRoleIdsFromCookie;

  if (completedRoleIds.includes(role.id)) {
    throw new Error("This role has already been completed in the current browser session.");
  }

  if (!hasDatabaseBinding()) {
    await appendLocalVote({
      session_key: sessionKey,
      role_id: role.id,
      candidate_id: candidate.id,
      timestamp: new Date().toISOString()
    });

    const updatedCompletedRoleIds = [...completedRoleIds, role.id];
    const updatedRoles = await getBallotRoles();
    const nextRole = updatedRoles.find(
      (item) => !updatedCompletedRoleIds.includes(item.id)
    );

    return {
      completed_role_id: role.id,
      completed_role_ids: updatedCompletedRoleIds,
      next_role_id: nextRole?.id ?? null,
      is_complete: !nextRole,
      session_state: serializeCompletedRoles(updatedCompletedRoleIds)
    };
  }

  const now = new Date().toISOString();
  const sessionRow = await queryFirst<{ id: string; completed_role_ids_json: string }>(
    getBindings(),
    `SELECT id, completed_role_ids_json
     FROM vote_sessions
     WHERE session_key = ?;`,
    [sessionKey]
  );

  let sessionId = sessionRow?.id;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    await execute(
      getBindings(),
      `INSERT INTO vote_sessions (
         id,
         session_key,
         election_id,
         completed_role_ids_json,
         created_at,
         updated_at
       ) VALUES (?, ?, ?, ?, ?, ?);`,
      [sessionId, sessionKey, "default-election", "[]", now, now]
    );
  }

  await execute(
    getBindings(),
    `INSERT INTO votes (id, session_id, candidate_id, role_id, timestamp)
     VALUES (?, ?, ?, ?, ?);`,
    [crypto.randomUUID(), sessionId, candidate.id, role.id, now]
  );

  const updatedCompletedRoleIds = [...completedRoleIds, role.id];
  await execute(
    getBindings(),
    `UPDATE vote_sessions
     SET completed_role_ids_json = ?, updated_at = ?
     WHERE id = ?;`,
    [serializeCompletedRoles(updatedCompletedRoleIds), now, sessionId]
  );

  const nextRole = roles.find((item) => !updatedCompletedRoleIds.includes(item.id));

  return {
    completed_role_id: role.id,
    completed_role_ids: updatedCompletedRoleIds,
    next_role_id: nextRole?.id ?? null,
    is_complete: !nextRole,
    session_state: serializeCompletedRoles(updatedCompletedRoleIds)
  };
}
