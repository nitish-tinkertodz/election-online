import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
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
  branding: {
    school_name: string;
    school_logo_url: string;
  };
  roles: LocalRole[];
  candidates: LocalCandidate[];
  votes: LocalVoteRecord[];
  finalResult: LocalFinalResultSnapshot | null;
  adminSessionLock: LocalAdminSessionLock | null;
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

export type LocalAdminSessionLock = {
  sessionToken: string;
  clientIp: string;
  expiresAt: string;
  issuedAt: string;
  updatedAt: string;
};

const initialState = (): LocalStateSnapshot => ({
  electionStatus: "NOT_STARTED",
  branding: {
    school_name: "School Election Voting System",
    school_logo_url: ""
  },
  roles: [...localRoles],
  candidates: [...localCandidates],
  votes: [],
  finalResult: null,
  adminSessionLock: null
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
  const statePath = getLocalStatePath();
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(nextState, null, 2), "utf8");
  await rename(temporaryPath, statePath);
}

let mutationQueue = Promise.resolve();

function updateLocalState(
  update: (state: LocalStateSnapshot) => LocalStateSnapshot | Promise<LocalStateSnapshot>
) {
  const mutation = mutationQueue.then(async () => {
    const state = await readLocalState();
    await writeLocalState(await update(state));
  });

  mutationQueue = mutation.catch(() => {});
  return mutation;
}

export async function getLocalElectionStatus() {
  const state = await readLocalState();
  return state.electionStatus;
}

export async function setLocalElectionStatus(status: ElectionStatus) {
  await updateLocalState((state) => ({
    ...state,
    electionStatus: status
  }));
}

export async function appendLocalVote(vote: LocalVoteRecord) {
  await updateLocalState((state) => {
    if (state.electionStatus !== "OPEN") {
      throw new Error("Voting is not open.");
    }

    return {
      ...state,
      votes: [...state.votes, vote]
    };
  });
}

export async function getLocalRolesState() {
  const state = await readLocalState();
  return [...state.roles].sort((left, right) => left.display_order - right.display_order);
}

export async function setLocalRolesState(roles: LocalRole[]) {
  await updateLocalState((state) => ({
    ...state,
    roles: [...roles].sort((left, right) => left.display_order - right.display_order)
  }));
}

export async function getLocalCandidatesState() {
  const state = await readLocalState();
  return [...state.candidates];
}

export async function setLocalCandidatesState(candidates: LocalCandidate[]) {
  await updateLocalState((state) => ({
    ...state,
    candidates: [...candidates]
  }));
}

export async function getLocalVotes() {
  const state = await readLocalState();
  return state.votes;
}

export async function setLocalFinalResult(finalResult: LocalFinalResultSnapshot) {
  await updateLocalState((state) => ({
    ...state,
    finalResult
  }));
}

export async function closeLocalElection<T>(
  buildFinalResult: () => Promise<{
    storedResult: LocalFinalResultSnapshot;
    response: T;
  }>
) {
  let response: T | undefined;

  await updateLocalState(async (state) => {
    if (state.electionStatus !== "OPEN") {
      throw new Error("Election can only be closed from OPEN.");
    }

    const finalResult = await buildFinalResult();
    response = finalResult.response;

    return {
      ...state,
      electionStatus: "CLOSED",
      finalResult: finalResult.storedResult
    };
  });

  return response as T;
}

export async function clearLocalFinalResult() {
  await updateLocalState((state) => ({
    ...state,
    finalResult: null
  }));
}

export async function getLocalFinalResult() {
  const state = await readLocalState();
  return state.finalResult;
}

export async function getLocalAdminSessionLock() {
  const state = await readLocalState();
  return state.adminSessionLock;
}

export async function setLocalAdminSessionLock(adminSessionLock: LocalAdminSessionLock | null) {
  await updateLocalState((state) => ({
    ...state,
    adminSessionLock
  }));
}

export async function getLocalBranding() {
  const state = await readLocalState();
  return state.branding;
}

export async function setLocalBranding(branding: LocalStateSnapshot["branding"]) {
  await updateLocalState((state) => ({
    ...state,
    branding
  }));
}

export function getLocalRoles() {
  return [...localRoles].sort((left, right) => left.display_order - right.display_order);
}

export function getLocalCandidates() {
  return [...localCandidates];
}

export async function resetLocalElectionState() {
  await updateLocalState(() => initialState());
}

export async function clearLocalElectionProgress() {
  await updateLocalState((state) => ({
    ...state,
    electionStatus: "NOT_STARTED",
    votes: [],
    finalResult: null
  }));
}
