import {
  getLocalCandidatesState,
  getLocalFinalResult,
  getLocalRolesState,
  getLocalVotes,
  setLocalFinalResult
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
        candidates: []
      });
    }

    if (row.candidate_id && row.candidate_name) {
      groupedRoles.get(row.role_id)?.candidates.push({
        candidate_id: row.candidate_id,
        candidate_name: row.candidate_name,
        class_name: row.class_name ?? "",
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

export async function buildLiveResultsSnapshot() {
  return buildLocalLiveSnapshot();
}

export async function getOfficialResultsSnapshot() {
  const finalResult = await getLocalFinalResult();
  if (!finalResult) {
    return null;
  }

  const storedSnapshot = JSON.parse(finalResult.result_json) as ResultsSnapshot;
  const liveSnapshot = await buildLocalLiveSnapshot();

  if (
    storedSnapshot.summary.total_votes_cast === liveSnapshot.summary.total_votes_cast
  ) {
    return storedSnapshot;
  }

  const repairedSnapshot: ResultsSnapshot = {
    ...liveSnapshot,
    election_status: "CLOSED",
    closed_at: storedSnapshot.closed_at ?? finalResult.generated_at,
    generated_at: finalResult.generated_at
  };

  await setLocalFinalResult({
    generated_at: finalResult.generated_at,
    result_json: JSON.stringify(repairedSnapshot),
    status: "FINAL"
  });

  return repairedSnapshot;
}
