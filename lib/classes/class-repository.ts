import { execute, queryAll } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";
import { classSchema } from "@/lib/validation";

export type ClassRecord = {
  id: string;
  name: string;
  display_order: number;
  status: "Active" | "Inactive";
  created_at: string;
  updated_at: string;
};

type ClassInput = {
  name: string;
  display_order: number;
  status: "Active" | "Inactive";
};

export async function listClasses(): Promise<ClassRecord[]> {
  return queryAll<ClassRecord>(
    getBindings(),
    "SELECT id, name, display_order, status, created_at, updated_at FROM classes ORDER BY display_order ASC;"
  );
}

export async function createClass(input: ClassInput) {
  const parsed = classSchema.parse(input);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await execute(
    getBindings(),
    `INSERT INTO classes (id, name, display_order, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [id, parsed.name, parsed.display_order, parsed.status, now, now]
  );

  return { id, ...parsed, created_at: now, updated_at: now };
}
