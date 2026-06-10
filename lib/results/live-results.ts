import { queryAll, queryFirst } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";
import {
  getLocalCandidatesState,
  getLocalFinalResult,
  getLocalRolesState,
  getLocalVotes
} from "@/lib/election/local-store";
import { rankCandidates } from "@/lib/results/ranking";

export type ResultsRoleCandidate = {
  candidate_id: string;
  candidate_name: string;
  class_name: string;
  photo_url: string;
  vote_count: number;
  rank: number;
  is_winner: boolean;
};

export type ResultsRole = {
  role_id: string;
  role_name: string;
  is_class_leader?: boolean;
  class_id?: string | null;
  division_id?: string | null;
  total_votes: number;
  is_tie: boolean;
  winner_candidate_id: string | null;
  candidates: ResultsRoleCandidate[];
};

export type ResultsSnapshot = {
  election_status: "OPEN" | "CLOSED";
  closed_at: string | null;
  generated_at: string;
  summary: {
    total_votes_cast: number;
  };
  roles: ResultsRole[];
};

type DatabaseResultsRow = {
  role_id: string;
  role_name: string;
  display_order: number;
  is_class_leader?: number;
  class_id?: string | null;
  division_id?: string | null;
  candidate_id: string | null;
  candidate_name: string | null;
  class_name: string | null;
  photo_url: string | null;
  vote_count: number;
};

function buildResultsSnapshotFromRows(
  rows: DatabaseResultsRow[],
  electionStatus: "OPEN" | "CLOSED",
  generatedAt: string,
  closedAt: string | null
): ResultsSnapshot {
  const groupedRoles = new Map<
    string,
    {
      role_id: string;
      role_name: string;
      display_order: number;
      is_class_leader?: number;
      class_id?: string | null;
      division_id?: string | null;
      candidates: Array<{
        candidate_id: string;
        candidate_name: string;
        class_name: string;
        photo_url: string;
        vote_count: number;
      }>;
    }
  >();

  for (const row of rows) {
    if (!groupedRoles.has(row.role_id)) {
      groupedRoles.set(row.role_id, {
        role_id: row.role_id,
        role_name: row.role_name,
        display_order: row.display_order,
        is_class_leader: row.is_class_leader,
        class_id: row.class_id ?? null,
        division_id: row.division_id ?? null,
        candidates: []
      });
    }

    if (row.candidate_id && row.candidate_name && row.class_name) {
      groupedRoles.get(row.role_id)?.candidates.push({
        candidate_id: row.candidate_id,
        candidate_name: row.candidate_name,
        class_name: row.class_name,
        photo_url: row.photo_url ?? "",
        vote_count: Number(row.vote_count ?? 0)
      });
    }
  }

  const roles = Array.from(groupedRoles.values())
    .sort((left, right) => left.display_order - right.display_order)
    .map((role) => {
      const ranked = rankCandidates(role.candidates);

      return {
        role_id: role.role_id,
        role_name: role.role_name,
        is_class_leader: Boolean(role.is_class_leader),
        class_id: role.class_id ?? null,
        division_id: role.division_id ?? null,
        total_votes: ranked.rankedCandidates.reduce(
          (sum, candidate) => sum + candidate.vote_count,
          0
        ),
        is_tie: ranked.isTie,
        winner_candidate_id: ranked.winnerCandidateId,
        candidates: ranked.rankedCandidates
      };
    });

  return {
    election_status: electionStatus,
    closed_at: closedAt,
    generated_at: generatedAt,
    summary: {
      total_votes_cast: roles.reduce((sum, role) => sum + role.total_votes, 0)
    },
    roles
  };
}

async function buildLocalLiveSnapshot() {
  const roles = (await getLocalRolesState()).filter((role) => role.status === "Active");
  const candidates = (await getLocalCandidatesState()).filter(
    (candidate) => candidate.status === "Active"
  );
  const votes = await getLocalVotes();

  const rows: DatabaseResultsRow[] = roles.flatMap<DatabaseResultsRow>((role) => {
    const roleCandidates = candidates.filter(
      (candidate) => candidate.role_id === role.id
    );

    if (roleCandidates.length === 0) {
      return [
        {
          role_id: role.id,
          role_name: role.name,
          display_order: role.display_order,
          candidate_id: null,
          candidate_name: null,
          class_name: null,
          photo_url: null,
          vote_count: 0
        }
      ];
    }

    return roleCandidates.map((candidate) => ({
      role_id: role.id,
      role_name: role.name,
      display_order: role.display_order,
      candidate_id: candidate.id,
      candidate_name: candidate.name,
      class_name: candidate.class_name,
      photo_url: candidate.photo_url,
      vote_count: votes.filter((vote) => vote.candidate_id === candidate.id).length
    }));
  });

  return buildResultsSnapshotFromRows(
    rows,
    "OPEN",
    new Date().toISOString(),
    null
  );
}

async function buildDatabaseLiveSnapshot() {
  const rows = await queryAll<DatabaseResultsRow>(
    getBindings(),
    `SELECT
       roles.id AS role_id,
       roles.name AS role_name,
       roles.display_order AS display_order,
       roles.is_class_leader AS is_class_leader,
       roles.class_id AS class_id,
       roles.division_id AS division_id,
       candidates.id AS candidate_id,
       candidates.name AS candidate_name,
       candidates.class_name AS class_name,
       candidates.photo_url AS photo_url,
       COUNT(votes.id) AS vote_count
     FROM roles
     LEFT JOIN candidates
       ON candidates.role_id = roles.id
      AND candidates.status = 'Active'
     LEFT JOIN votes
       ON votes.candidate_id = candidates.id
     WHERE roles.status = 'Active'
     GROUP BY
       roles.id,
       roles.name,
       roles.display_order,
       roles.is_class_leader,
       roles.class_id,
       roles.division_id,
       candidates.id,
       candidates.name,
       candidates.class_name,
       candidates.photo_url
     ORDER BY roles.display_order ASC, candidates.name ASC;`
  );

  return buildResultsSnapshotFromRows(
    rows,
    "OPEN",
    new Date().toISOString(),
    null
  );
}

export async function buildLiveResultsSnapshot() {
  if (!getBindings().DB) {
    return buildLocalLiveSnapshot();
  }

  return buildDatabaseLiveSnapshot();
}

export async function getOfficialResultsSnapshot() {
  if (!getBindings().DB) {
    const finalResult = await getLocalFinalResult();
    if (!finalResult) {
      return null;
    }

    return JSON.parse(finalResult.result_json) as ResultsSnapshot;
  }

  const stored = await queryFirst<{ result_json: string }>(
    getBindings(),
    `SELECT result_json
     FROM election_results
     WHERE election_id = ?
       AND status = 'FINAL'
     ORDER BY generated_at DESC
     LIMIT 1;`,
    ["default-election"]
  );

  if (!stored?.result_json) {
    return null;
  }

  return JSON.parse(stored.result_json) as ResultsSnapshot;
}
