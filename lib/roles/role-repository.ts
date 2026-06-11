import { deleteCandidate } from "@/lib/candidates/candidate-repository";
import {
  getLocalCandidatesState,
  getLocalRolesState,
  setLocalRolesState,
  type LocalRole
} from "@/lib/election/local-store";
import { roleSchema } from "@/lib/validation";

type RoleInput = {
  name: string;
  description?: string;
  display_order: number;
  status: "Active" | "Inactive";
};

export type RoleRecord = RoleInput & {
  id: string;
  election_id: string;
  created_at: string;
  updated_at: string;
};

export async function listRoles(): Promise<RoleRecord[]> {
  const now = new Date().toISOString();
  return (await getLocalRolesState()).map((role) => ({
    ...role,
    election_id: "default-election",
    created_at: now,
    updated_at: now
  }));
}

export async function createRole(input: RoleInput) {
  const roles = await getLocalRolesState();
  const nextDisplayOrder =
    roles.reduce(
      (highestOrder, role) => Math.max(highestOrder, role.display_order),
      0
    ) + 1;
  const role = roleSchema.parse({
    ...input,
    display_order: nextDisplayOrder
  });
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const nextRole: LocalRole = {
    id,
    name: role.name,
    description: role.description || "",
    display_order: role.display_order,
    status: role.status
  };

  await setLocalRolesState([...roles, nextRole]);
  return { id, election_id: "default-election", ...role, created_at: now, updated_at: now };
}

export async function updateRole(
  roleId: string,
  input: RoleInput
) {
  const role = roleSchema.parse(input);
  const now = new Date().toISOString();

  const roles = await getLocalRolesState();
  await setLocalRolesState(
    roles.map((item) =>
      item.id === roleId
        ? {
            id: roleId,
            name: role.name,
            description: role.description || "",
            display_order: role.display_order,
            status: role.status
          }
        : item
    )
  );

  return {
    id: roleId,
    election_id: "default-election",
    ...role,
    updated_at: now
  };
}

export async function deleteRole(roleId: string) {
  const [roles, candidates] = await Promise.all([
    getLocalRolesState(),
    getLocalCandidatesState()
  ]);

  await Promise.all(
    candidates
      .filter((candidate) => candidate.role_id === roleId)
      .map((candidate) => deleteCandidate(candidate.id))
  );
  await setLocalRolesState(roles.filter((role) => role.id !== roleId));
  return { id: roleId };
}
