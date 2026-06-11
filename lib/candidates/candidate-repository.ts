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
  const now = new Date().toISOString();
  return (await getLocalCandidatesState()).map((candidate) => ({
    ...candidate,
    created_at: now,
    updated_at: now
  }));
}

export async function createCandidate(input: CandidateInput) {
  const candidate = candidateSchema.parse(input);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const candidates = await getLocalCandidatesState();
  const nextCandidate: LocalCandidate = {
    id,
    role_id: candidate.role_id,
    name: candidate.name,
    class_name: candidate.class_name,
    photo_url: candidate.photo_url || "",
    status: candidate.status
  };

  await setLocalCandidatesState([...candidates, nextCandidate]);
  return { id, ...candidate, created_at: now, updated_at: now };
}

export async function updateCandidate(
  candidateId: string,
  input: CandidateInput
) {
  const candidate = candidateSchema.parse(input);
  const now = new Date().toISOString();

  const candidates = await getLocalCandidatesState();
  await setLocalCandidatesState(
    candidates.map((item) =>
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
    )
  );

  return { id: candidateId, ...candidate, updated_at: now };
}

export async function updateCandidatePhotoUrl(
  candidateId: string,
  photoUrl: string
) {
  const now = new Date().toISOString();

  const candidates = await getLocalCandidatesState();
  await setLocalCandidatesState(
    candidates.map((item) =>
      item.id === candidateId ? { ...item, photo_url: photoUrl } : item
    )
  );

  return { id: candidateId, photo_url: photoUrl, updated_at: now };
}

export async function deleteCandidate(candidateId: string) {
  const candidates = await getLocalCandidatesState();
  await setLocalCandidatesState(
    candidates.filter((candidate) => candidate.id !== candidateId)
  );
  return { id: candidateId };
}
