import { execute, queryAll } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";
import { candidateSchema } from "@/lib/validation";

type CandidateInput = {
  name: string;
  class_name: string;
  role_id: string;
  photo_url?: string;
  status: "Active" | "Inactive";
};

export async function listCandidates() {
  return queryAll(
    getBindings(),
    `SELECT id, role_id, name, class_name, photo_url, status, created_at, updated_at
     FROM candidates
     ORDER BY created_at DESC;`
  );
}

export async function createCandidate(input: CandidateInput) {
  const candidate = candidateSchema.parse(input);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await execute(
    getBindings(),
    `INSERT INTO candidates (id, role_id, name, class_name, photo_url, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      candidate.role_id,
      candidate.name,
      candidate.class_name,
      candidate.photo_url || "",
      candidate.status,
      now,
      now
    ]
  );

  return { id, ...candidate, created_at: now, updated_at: now };
}
