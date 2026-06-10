import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ElectionStatus } from "@/lib/election/status";

export type LocalRole = {
  id: string;
  name: string;
  description: string;
  display_order: number;
  status: "Active" | "Inactive";
};

export type LocalCandidate = {
  id: string;
  role_id: string;
  name: string;
  class_name: string;
  photo_url: string;
  status: "Active" | "Inactive";
};

type LocalStateSnapshot = {
  electionStatus: ElectionStatus;
  roles: LocalRole[];
  candidates: LocalCandidate[];
  votes: LocalVoteRecord[];
  finalResult: LocalFinalResultSnapshot | null;
};

export type LocalVoteRecord = {
  session_key: string;
  role_id: string;
  candidate_id: string;
  timestamp: string;
};

export type LocalFinalResultSnapshot = {
  generated_at: string;
  result_json: string;
  status: "FINAL";
};

const initialState = (): LocalStateSnapshot => ({
  electionStatus: "NOT_STARTED",
  roles: [...localRoles],
  candidates: [...localCandidates],
  votes: [],
  finalResult: null
});

const localRoles: LocalRole[] = [];

const localCandidates: LocalCandidate[] = [];

function getLocalStatePath() {
  return path.join(process.cwd(), ".local-dev", "election-state.json");
}

async function ensureLocalStateDir() {
  await mkdir(path.join(process.cwd(), ".local-dev"), { recursive: true });
}

async function readLocalState() {
  try {
    await ensureLocalStateDir();
    await access(getLocalStatePath());
    const raw = await readFile(getLocalStatePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalStateSnapshot>;
    return {
      ...initialState(),
      ...parsed
    };
  } catch {
    return initialState();
  }
}

async function writeLocalState(nextState: LocalStateSnapshot) {
  await ensureLocalStateDir();
  await writeFile(getLocalStatePath(), JSON.stringify(nextState, null, 2), "utf8");
}

export async function getLocalElectionStatus() {
  const state = await readLocalState();
  return state.electionStatus;
}

export async function setLocalElectionStatus(status: ElectionStatus) {
  const state = await readLocalState();
  await writeLocalState({
    ...state,
    electionStatus: status
  });
}

export async function appendLocalVote(vote: LocalVoteRecord) {
  const state = await readLocalState();
  await writeLocalState({
    ...state,
    votes: [...state.votes, vote]
  });
}

export async function getLocalRolesState() {
  const state = await readLocalState();
  return [...state.roles].sort((left, right) => left.display_order - right.display_order);
}

export async function setLocalRolesState(roles: LocalRole[]) {
  const state = await readLocalState();
  await writeLocalState({
    ...state,
    roles: [...roles].sort((left, right) => left.display_order - right.display_order)
  });
}

export async function getLocalCandidatesState() {
  const state = await readLocalState();
  return [...state.candidates];
}

export async function setLocalCandidatesState(candidates: LocalCandidate[]) {
  const state = await readLocalState();
  await writeLocalState({
    ...state,
    candidates: [...candidates]
  });
}

export async function getLocalVotes() {
  const state = await readLocalState();
  return state.votes;
}

export async function setLocalFinalResult(finalResult: LocalFinalResultSnapshot) {
  const state = await readLocalState();
  await writeLocalState({
    ...state,
    finalResult
  });
}

export async function clearLocalFinalResult() {
  const state = await readLocalState();
  await writeLocalState({
    ...state,
    finalResult: null
  });
}

export async function getLocalFinalResult() {
  const state = await readLocalState();
  return state.finalResult;
}

export function getLocalRoles() {
  return [...localRoles].sort((left, right) => left.display_order - right.display_order);
}

export function getLocalCandidates() {
  return [...localCandidates];
}

export async function resetLocalElectionState() {
  await writeLocalState(initialState());
}
