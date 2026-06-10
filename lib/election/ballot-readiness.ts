import { listCandidates } from "@/lib/candidates/candidate-repository";
import { listRoles } from "@/lib/roles/role-repository";

export async function hasReadyBallot() {
  const [roles, candidates] = await Promise.all([listRoles(), listCandidates()]);
  const activeRoleIds = new Set(
    roles.filter((role) => role.status === "Active").map((role) => role.id)
  );

  return candidates.some(
    (candidate) =>
      candidate.status === "Active" && activeRoleIds.has(candidate.role_id)
  );
}
