import { listCandidates } from "@/lib/candidates/candidate-repository";
import { listRoles } from "@/lib/roles/role-repository";

export async function hasReadyBallot() {
  const [roles, candidates] = await Promise.all([listRoles(), listCandidates()]);
  const activeRoleIds = new Set(
    roles.filter((role) => role.status === "Active").map((role) => role.id)
  );

  const activeCandidatesByRole = new Map<string, number>();

  for (const candidate of candidates) {
    if (candidate.status !== "Active" || !activeRoleIds.has(candidate.role_id)) {
      continue;
    }

    activeCandidatesByRole.set(
      candidate.role_id,
      (activeCandidatesByRole.get(candidate.role_id) ?? 0) + 1
    );
  }

  return Array.from(activeCandidatesByRole.values()).some((count) => count >= 2);
}
