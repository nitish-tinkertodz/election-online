import { execute, queryAll } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";
import { roleSchema } from "@/lib/validation";

type RoleInput = {
  name: string;
  description?: string;
  display_order: number;
  status: "Active" | "Inactive";
};

export async function listRoles() {
  return queryAll(
    getBindings(),
    "SELECT id, election_id, name, description, display_order, status, created_at, updated_at FROM roles ORDER BY display_order ASC;"
  );
}

export async function createRole(input: RoleInput) {
  const role = roleSchema.parse(input);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

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
