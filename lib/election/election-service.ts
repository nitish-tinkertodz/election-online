import { hasReadyBallot } from "@/lib/election/ballot-readiness";
import {
  clearLocalElectionProgress,
  clearLocalFinalResult,
  closeLocalElection,
  getLocalElectionStatus,
  resetLocalElectionState,
  setLocalElectionStatus
} from "@/lib/election/local-store";
import { canCloseElection, canOpenElection } from "@/lib/election/status";
import { publishElectionStatus } from "@/lib/election/status-events";
import { buildFinalResultsSnapshot } from "@/lib/results/finalize-election";

export async function getElectionStatus() {
  return getLocalElectionStatus();
}

export async function openElection() {
  const readyBallot = await hasReadyBallot();
  if (!readyBallot) {
    throw new Error("Add at least one active candidate before opening the ballot.");
  }

  const currentStatus = await getLocalElectionStatus();

  if (!canOpenElection(currentStatus)) {
    throw new Error("Election can only be opened from NOT_STARTED.");
  }

  const now = new Date().toISOString();
  await clearLocalFinalResult();
  await setLocalElectionStatus("OPEN");
  publishElectionStatus("OPEN");

  return { status: "OPEN" as const, started_at: now };
}

export async function closeElection() {
  const currentStatus = await getLocalElectionStatus();

  if (!canCloseElection(currentStatus)) {
    throw new Error("Election can only be closed from OPEN.");
  }

  const snapshot = await closeLocalElection(async () => {
    const finalSnapshot = await buildFinalResultsSnapshot();

    return {
      storedResult: {
        generated_at: finalSnapshot.generated_at,
        result_json: JSON.stringify(finalSnapshot),
        status: "FINAL" as const
      },
      response: finalSnapshot
    };
  });
  publishElectionStatus("CLOSED");

  return {
    status: "CLOSED" as const,
    closed_at: snapshot.closed_at,
    result_id: "local-final-result",
    summary: snapshot.summary
  };
}

export async function resetLocalElection() {
  await resetLocalElectionState();
}

export async function resetElection() {
  await clearLocalElectionProgress();
  publishElectionStatus("NOT_STARTED");

  return {
    status: "NOT_STARTED" as const,
    cleared_votes: true,
    cleared_results: true
  };
}
