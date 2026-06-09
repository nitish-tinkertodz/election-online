export const ELECTION_STATUSES = ["NOT_STARTED", "OPEN", "CLOSED"] as const;

export type ElectionStatus = (typeof ELECTION_STATUSES)[number];

export function isElectionStatus(value: string): value is ElectionStatus {
  return ELECTION_STATUSES.includes(value as ElectionStatus);
}

export function canOpenElection(status: ElectionStatus) {
  return status === "NOT_STARTED";
}

export function canCloseElection(status: ElectionStatus) {
  return status === "OPEN";
}

export function getElectionAvailabilityMessage(status: ElectionStatus) {
  if (status === "NOT_STARTED") {
    return "Voting has not started yet.";
  }

  if (status === "CLOSED") {
    return "Voting has been closed.";
  }

  return "Voting is open.";
}
