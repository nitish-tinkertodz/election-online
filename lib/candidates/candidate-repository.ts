import { execute, queryAll } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";
import {
  getLocalCandidatesState,
  setLocalCandidatesState,
  type LocalCandidate
} from "@/lib/election/local-store";
import { candidateSchema } from "@/lib/validation";

type CandidateInput = {
  name: string;
  class_name: string;
  role_id: string;
  photo_url?: string;
  status: "Active" | "Inactive";
};

export type CandidateRecord = CandidateInput & {
  id: string;
  created_at: string;
  updated_at: string;
};

export async function listCandidates(): Promise<CandidateRecord[]> {
  if (!getBindings().DB) {
    const now = new Date().toISOString();
    return (await getLocalCandidatesState()).map((candidate) => ({
      ...candidate,
      created_at: now,
      updated_at: now
    }));
  }

  return queryAll<CandidateRecord>(
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

  if (!getBindings().DB) {
    const candidates = await getLocalCandidatesState();
    const nextCandidate: LocalCandidate = {
      id,
      role_id: candidate.role_id,
      name: candidate.name,
      class_name: candidate.class_name,
      photo_url: candidate.photo_url || "",
      status: candidate.status
    };

    await setLocalCandidatesState([...candidates.filter((item) => item.id !== id), nextCandidate]);
    return { id, ...candidate, created_at: now, updated_at: now };
  }

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

export async function updateCandidate(
  candidateId: string,
  input: CandidateInput
) {
  const candidate = candidateSchema.parse(input);
  const now = new Date().toISOString();

  if (!getBindings().DB) {
    const candidates = await getLocalCandidatesState();
    const nextCandidates = candidates.map((item) =>
      item.id === candidateId
        ? {
            id: candidateId,
            role_id: candidate.role_id,
            name: candidate.name,
            class_name: candidate.class_name,
            photo_url: candidate.photo_url || "",
            status: candidate.status
          }
        : item
    );
    await setLocalCandidatesState(nextCandidates);
    return { id: candidateId, ...candidate, updated_at: now };
  }

  await execute(
    getBindings(),
    `UPDATE candidates
     SET role_id = ?, name = ?, class_name = ?, photo_url = ?, status = ?, updated_at = ?
     WHERE id = ?;`,
    [
      candidate.role_id,
      candidate.name,
      candidate.class_name,
      candidate.photo_url || "",
      candidate.status,
      now,
      candidateId
    ]
  );

  return { id: candidateId, ...candidate, updated_at: now };
}

export async function updateCandidatePhotoUrl(
  candidateId: string,
  photoUrl: string
) {
  const now = new Date().toISOString();

  if (!getBindings().DB) {
    const candidates = await getLocalCandidatesState();
    const nextCandidates = candidates.map((item) =>
      item.id === candidateId
        ? {
            ...item,
            photo_url: photoUrl
          }
        : item
    );
    await setLocalCandidatesState(nextCandidates);
    return { id: candidateId, photo_url: photoUrl, updated_at: now };
  }

  await execute(
    getBindings(),
    `UPDATE candidates
     SET photo_url = ?, updated_at = ?
     WHERE id = ?;`,
    [photoUrl, now, candidateId]
  );

  return { id: candidateId, photo_url: photoUrl, updated_at: now };
}

export async function deleteCandidate(candidateId: string) {
  if (!getBindings().DB) {
    const candidates = await getLocalCandidatesState();
    await setLocalCandidatesState(
      candidates.filter((candidate) => candidate.id !== candidateId)
    );
    return { id: candidateId };
  }

  await execute(
    getBindings(),
    `DELETE FROM candidates
     WHERE id = ?;`,
    [candidateId]
  );

  return { id: candidateId };
}
