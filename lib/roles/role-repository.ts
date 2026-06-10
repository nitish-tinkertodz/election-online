import { execute, queryAll } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";
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
  if (!getBindings().DB) {
    const now = new Date().toISOString();
    return (await getLocalRolesState()).map((role) => ({
      ...role,
      election_id: "default-election",
      created_at: now,
      updated_at: now
    }));
  }

  return queryAll<RoleRecord>(
    getBindings(),
    "SELECT id, election_id, name, description, display_order, status, created_at, updated_at FROM roles ORDER BY display_order ASC;"
  );
}

export async function createRole(input: RoleInput) {
  const role = roleSchema.parse(input);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  if (!getBindings().DB) {
    const roles = await getLocalRolesState();
    const nextRole: LocalRole = {
      id,
      name: role.name,
      description: role.description || "",
      display_order: role.display_order,
      status: role.status
    };

    await setLocalRolesState([...roles.filter((item) => item.id !== id), nextRole]);
    return {
      id,
      election_id: "default-election",
      ...role,
      created_at: now,
      updated_at: now
    };
  }

  await execute(
    getBindings(),
    `INSERT INTO roles (id, election_id, name, description, display_order, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      "default-election",
      role.name,
      role.description || "",
      role.display_order,
      role.status,
      now,
      now
    ]
  );

  return { id, election_id: "default-election", ...role, created_at: now, updated_at: now };
}

export async function updateRole(
  roleId: string,
  input: RoleInput
) {
  const role = roleSchema.parse(input);
  const now = new Date().toISOString();

  if (!getBindings().DB) {
    const roles = await getLocalRolesState();
    const nextRoles = roles.map((item) =>
      item.id === roleId
        ? {
            id: roleId,
            name: role.name,
            description: role.description || "",
            display_order: role.display_order,
            status: role.status
          }
        : item
    );
    await setLocalRolesState(nextRoles);
    return {
      id: roleId,
      election_id: "default-election",
      ...role,
      updated_at: now
    };
  }

  await execute(
    getBindings(),
    `UPDATE roles
     SET name = ?, description = ?, display_order = ?, status = ?, updated_at = ?
     WHERE id = ?;`,
    [
      role.name,
      role.description || "",
      role.display_order,
      role.status,
      now,
      roleId
    ]
  );

  return {
    id: roleId,
    election_id: "default-election",
    ...role,
    updated_at: now
  };
}

export async function deleteRole(roleId: string) {
  if (!getBindings().DB) {
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

  await execute(
    getBindings(),
    `DELETE FROM candidates
     WHERE role_id = ?;`,
    [roleId]
  );
  await execute(
    getBindings(),
    `DELETE FROM roles
     WHERE id = ?;`,
    [roleId]
  );

  return { id: roleId };
}
