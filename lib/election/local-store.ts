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
  votes: [],
  finalResult: null
});

const localRoles: LocalRole[] = [
  {
    id: "role_school_leader",
    name: "School Leader",
    description: "Represents the school community.",
    display_order: 1,
    status: "Active"
  },
  {
    id: "role_sports_captain",
    name: "Sports Captain",
    description: "Leads school sports culture and participation.",
    display_order: 2,
    status: "Active"
  },
  {
    id: "role_arts_captain",
    name: "Arts Captain",
    description: "Represents arts, culture, and performance.",
    display_order: 3,
    status: "Active"
  }
];

const localCandidates: LocalCandidate[] = [
  {
    id: "candidate_a",
    role_id: "role_school_leader",
    name: "Aanya Rao",
    class_name: "10A",
    photo_url: "",
    status: "Active"
  },
  {
    id: "candidate_b",
    role_id: "role_school_leader",
    name: "Rohan Mehta",
    class_name: "10B",
    photo_url: "",
    status: "Active"
  },
  {
    id: "candidate_c",
    role_id: "role_sports_captain",
    name: "Kabir Singh",
    class_name: "9C",
    photo_url: "",
    status: "Active"
  },
  {
    id: "candidate_d",
    role_id: "role_sports_captain",
    name: "Mira Patel",
    class_name: "9A",
    photo_url: "",
    status: "Active"
  },
  {
    id: "candidate_e",
    role_id: "role_arts_captain",
    name: "Sara Joseph",
    class_name: "8B",
    photo_url: "",
    status: "Active"
  },
  {
    id: "candidate_f",
    role_id: "role_arts_captain",
    name: "Neil Thomas",
    class_name: "8C",
    photo_url: "",
    status: "Active"
  }
];

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
