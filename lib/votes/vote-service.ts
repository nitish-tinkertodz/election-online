import {
  appendLocalVote,
  getLocalVotes,
  getLocalVotingState,
  type LocalVotingStateSnapshot
} from "@/lib/election/local-store";
import { serializeCompletedRoles } from "@/lib/election/session";
import { voteSubmissionSchema } from "@/lib/validation";

type BallotRole = {
  id: string;
  name: string;
  description: string;
  display_order: number;
  status: "Active" | "Inactive";
  candidates: {
    id: string;
    name: string;
    class_name: string;
    photo_url: string;
    status: "Active" | "Inactive";
  }[];
};

function buildBallotRoles(state: LocalVotingStateSnapshot): BallotRole[] {
  const roles = state.roles.filter(
    (role) => role.status === "Active"
  );
  const candidates = state.candidates.filter(
    (candidate) => candidate.status === "Active"
  );

  return roles.map((role) => ({
    ...role,
    candidates: candidates.filter((candidate) => candidate.role_id === role.id)
  }));
}

export async function getBallotRoles() {
  return buildBallotRoles(await getLocalVotingState());
}

export async function getVotingPortalState(sessionKey: string) {
  const state = await getLocalVotingState();
  const electionStatus = state.electionStatus;
  const roles = buildBallotRoles(state);
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

export async function getCompletedRoleIds(sessionKey: string): Promise<string[]> {
  if (!sessionKey || sessionKey === "pending-session") {
    return [];
  }

  const votes = await getLocalVotes();
  return [
    ...new Set(
      votes
        .filter((vote) => vote.session_key === sessionKey)
        .map((vote) => vote.role_id)
    )
  ];
}

export async function submitRoleVote(
  sessionKey: string,
  payload: unknown
) {
  const parsed = voteSubmissionSchema.parse(payload);
  const state = await getLocalVotingState();
  const electionStatus = state.electionStatus;
  const roles = buildBallotRoles(state);

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

  const completedRoleIds = await getCompletedRoleIds(sessionKey);

  if (completedRoleIds.includes(role.id)) {
    throw new Error("This role has already been completed in the current browser session.");
  }

  await appendLocalVote({
    session_key: sessionKey,
    role_id: role.id,
    candidate_id: candidate.id,
    timestamp: new Date().toISOString()
  });

  const updatedCompletedRoleIds = [...completedRoleIds, role.id];
  const nextRole = roles.find((item) => !updatedCompletedRoleIds.includes(item.id));

  return {
    completed_role_id: role.id,
    completed_role_ids: updatedCompletedRoleIds,
    next_role_id: nextRole?.id ?? null,
    is_complete: !nextRole,
    session_state: serializeCompletedRoles(updatedCompletedRoleIds)
  };
}
