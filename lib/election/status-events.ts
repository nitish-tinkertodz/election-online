import type { ElectionStatus } from "@/lib/election/status";

type ElectionStatusListener = (status: ElectionStatus) => void;

const globalEvents = globalThis as typeof globalThis & {
  electionStatusListeners?: Set<ElectionStatusListener>;
};

function getListeners() {
  globalEvents.electionStatusListeners ??= new Set<ElectionStatusListener>();
  return globalEvents.electionStatusListeners;
}

export function publishElectionStatus(status: ElectionStatus) {
  for (const listener of getListeners()) {
    listener(status);
  }
}

export function subscribeToElectionStatus(listener: ElectionStatusListener) {
  const listeners = getListeners();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
