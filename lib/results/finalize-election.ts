import { queryAll } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";

type RoleResultRow = {
  role_id: string;
  role_name: string;
  candidate_id: string;
  candidate_name: string;
  class_name: string;
  vote_count: number;
};

export async function buildFinalResultsSnapshot() {
  const rows = await queryAll<RoleResultRow>(
    getBindings(),
    `SELECT
       roles.id AS role_id,
       roles.name AS role_name,
       candidates.id AS candidate_id,
       candidates.name AS candidate_name,
       candidates.class_name AS class_name,
       COUNT(votes.id) AS vote_count
     FROM roles
     LEFT JOIN candidates ON candidates.role_id = roles.id
     LEFT JOIN votes ON votes.candidate_id = candidates.id
     GROUP BY roles.id, roles.name, candidates.id, candidates.name, candidates.class_name
     ORDER BY roles.display_order ASC, vote_count DESC, candidates.name ASC;`
  );

  const groupedRoles = new Map<string, { role_id: string; role_name: string; candidates: RoleResultRow[] }>();

  for (const row of rows) {
    if (!groupedRoles.has(row.role_id)) {
      groupedRoles.set(row.role_id, {
        role_id: row.role_id,
        role_name: row.role_name,
        candidates: []
      });
    }

    if (row.candidate_id) {
      groupedRoles.get(row.role_id)?.candidates.push(row);
    }
  }

  const roles = Array.from(groupedRoles.values()).map((role) => {
    const topScore = role.candidates[0]?.vote_count ?? 0;
    const leaders = role.candidates.filter((candidate) => candidate.vote_count === topScore);

    return {
      role_id: role.role_id,
      role_name: role.role_name,
      total_votes: role.candidates.reduce((sum, candidate) => sum + Number(candidate.vote_count || 0), 0),
      is_tie: leaders.length > 1 && topScore > 0,
      winner_candidate_id: leaders.length === 1 ? leaders[0]?.candidate_id : null,
      candidates: role.candidates.map((candidate, index) => ({
        candidate_id: candidate.candidate_id,
        candidate_name: candidate.candidate_name,
        class_name: candidate.class_name,
        vote_count: Number(candidate.vote_count || 0),
        rank: index + 1,
        is_winner: leaders.length === 1 && leaders[0]?.candidate_id === candidate.candidate_id
      }))
    };
  });

  return {
    election_status: "CLOSED",
    closed_at: new Date().toISOString(),
    summary: {
      total_votes_cast: roles.reduce((sum, role) => sum + role.total_votes, 0)
    },
    roles
  };
}
