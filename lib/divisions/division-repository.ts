import { execute, queryAll } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";
import { divisionSchema } from "@/lib/validation";

export type DivisionRecord = {
  id: string;
  class_id: string;
  name: string;
  display_order: number;
  status: "Active" | "Inactive";
  created_at: string;
  updated_at: string;
};

type DivisionInput = {
  class_id: string;
  name: string;
  display_order: number;
  status: "Active" | "Inactive";
};

export async function listDivisions(): Promise<DivisionRecord[]> {
  return queryAll<DivisionRecord>(
    getBindings(),
    "SELECT id, class_id, name, display_order, status, created_at, updated_at FROM divisions ORDER BY display_order ASC;"
  );
}

export async function listDivisionsForClass(classId: string): Promise<DivisionRecord[]> {
  return queryAll<DivisionRecord>(
    getBindings(),
    "SELECT id, class_id, name, display_order, status, created_at, updated_at FROM divisions WHERE class_id = ? ORDER BY display_order ASC;",
    [classId]
  );
}

export async function isDivisionInClass(divisionId: string, classId: string) {
  const division = await queryAll<DivisionRecord>(
    getBindings(),
    "SELECT id, class_id, name, display_order, status, created_at, updated_at FROM divisions WHERE id = ? LIMIT 1;",
    [divisionId]
  );

  return division[0]?.class_id === classId;
}

export async function createDivision(input: DivisionInput) {
  const parsed = divisionSchema.parse(input);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await execute(
    getBindings(),
    `INSERT INTO divisions (id, class_id, name, display_order, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [id, parsed.class_id, parsed.name, parsed.display_order, parsed.status, now, now]
  );

  return { id, ...parsed, created_at: now, updated_at: now };
}
