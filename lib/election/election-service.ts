import { execute, queryFirst } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";
import { hasReadyBallot } from "@/lib/election/ballot-readiness";
import {
  clearLocalElectionProgress,
  clearLocalFinalResult,
  getLocalElectionStatus,
  setLocalFinalResult,
  resetLocalElectionState,
  setLocalElectionStatus
} from "@/lib/election/local-store";
import {
  canCloseElection,
  canOpenElection,
  type ElectionStatus
} from "@/lib/election/status";
import { buildFinalResultsSnapshot } from "@/lib/results/finalize-election";
import { queryAll } from "@/lib/db";

type ElectionRow = {
  id: string;
  status: ElectionStatus;
  scope_type: "SCHOOL" | "CLASS";
  class_id: string | null;
  division_id: string | null;
  started_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getElection() {
  return queryFirst<ElectionRow>(
    getBindings(),
    "SELECT id, status, scope_type, class_id, division_id, started_at, closed_at, created_at, updated_at FROM elections WHERE id = ?;",
    ["default-election"]
  );
}

export async function getElectionStatus() {
  if (!getBindings().DB) {
    return getLocalElectionStatus();
  }

  const election = await getElection();
  return election?.status ?? "NOT_STARTED";
}

export async function openElection(scope?: {
  scope_type?: "SCHOOL" | "CLASS";
  class_id?: string | null;
  division_id?: string | null;
}) {
  const readyBallot = await hasReadyBallot();
  if (!readyBallot) {
    throw new Error("Add at least one active role with at least two active candidates before opening the ballot.");
  }

  if (!getBindings().DB) {
    const currentStatus = await getLocalElectionStatus();
    if (!canOpenElection(currentStatus)) {
      throw new Error("Election can only be opened from NOT_STARTED.");
    }

    await clearLocalFinalResult();
    await setLocalElectionStatus("OPEN");

    return { status: "OPEN" as const, started_at: new Date().toISOString() };
  }

  const election = await getElection();
  const currentStatus = election?.status ?? "NOT_STARTED";

  if (!canOpenElection(currentStatus)) {
    throw new Error("Election can only be opened from NOT_STARTED.");
  }

  if (
    scope?.scope_type === "CLASS" &&
    scope.class_id &&
    scope.division_id
  ) {
    const duplicate = await queryAll<{
      id: string;
    }>(
      getBindings(),
      `SELECT id
       FROM elections
       WHERE status = 'OPEN'
         AND scope_type = 'CLASS'
         AND class_id = ?
         AND division_id = ?;`,
      [scope.class_id, scope.division_id]
    );

    if (duplicate.length > 0) {
      throw new Error("A class leader election is already open for that class and division.");
    }
  }

  const now = new Date().toISOString();
  const scopeType = scope?.scope_type ?? election?.scope_type ?? "SCHOOL";
  const classId = scope?.class_id ?? election?.class_id ?? null;
  const divisionId = scope?.division_id ?? election?.division_id ?? null;

  await execute(
    getBindings(),
    `UPDATE elections
     SET status = ?, scope_type = ?, class_id = ?, division_id = ?, started_at = ?, updated_at = ?
     WHERE id = ?;`,
    ["OPEN", scopeType, classId, divisionId, now, now, "default-election"]
  );
  await execute(
    getBindings(),
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);",
    ["election_status", "OPEN"]
  );

  return { status: "OPEN" as const, started_at: now };
}

export async function closeElection() {
  if (!getBindings().DB) {
    const currentStatus = await getLocalElectionStatus();
    if (!canCloseElection(currentStatus)) {
      throw new Error("Election can only be closed from OPEN.");
    }

    const snapshot = await buildFinalResultsSnapshot();
    await setLocalFinalResult({
      generated_at: snapshot.generated_at,
      result_json: JSON.stringify(snapshot),
      status: "FINAL"
    });
    await setLocalElectionStatus("CLOSED");

    return {
      status: "CLOSED" as const,
      closed_at: snapshot.closed_at,
      result_id: "local-final-result",
      summary: snapshot.summary
    };
  }

  const election = await getElection();
  const currentStatus = election?.status ?? "NOT_STARTED";

  if (!canCloseElection(currentStatus)) {
    throw new Error("Election can only be closed from OPEN.");
  }

  const now = new Date().toISOString();
  const snapshot = await buildFinalResultsSnapshot();
  const resultId = crypto.randomUUID();

  await execute(
    getBindings(),
    `UPDATE elections
     SET status = ?, closed_at = ?, updated_at = ?
     WHERE id = ?;`,
    ["CLOSED", now, now, "default-election"]
  );
  await execute(
    getBindings(),
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);",
    ["election_status", "CLOSED"]
  );
  await execute(
    getBindings(),
    `INSERT INTO election_results (id, election_id, generated_at, total_votes_cast, result_json, status)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      resultId,
      "default-election",
      now,
      snapshot.summary.total_votes_cast,
      JSON.stringify(snapshot),
      "FINAL"
    ]
  );

  return { status: "CLOSED" as const, closed_at: now, result_id: resultId, summary: snapshot.summary };
}

export async function resetLocalElection() {
  if (!getBindings().DB) {
    await resetLocalElectionState();
  }
}

export async function resetElection() {
  if (!getBindings().DB) {
    await clearLocalElectionProgress();
    return {
      status: "NOT_STARTED" as const,
      cleared_votes: true,
      cleared_results: true
    };
  }

  const now = new Date().toISOString();

  await execute(getBindings(), "DELETE FROM votes;");
  await execute(getBindings(), "DELETE FROM vote_sessions;");
  await execute(getBindings(), "DELETE FROM election_results;");
  await execute(
    getBindings(),
    `UPDATE elections
     SET status = ?, started_at = NULL, closed_at = NULL, updated_at = ?
     WHERE id = ?;`,
    ["NOT_STARTED", now, "default-election"]
  );
  await execute(
    getBindings(),
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);",
    ["election_status", "NOT_STARTED"]
  );

  return {
    status: "NOT_STARTED" as const,
    cleared_votes: true,
    cleared_results: true
  };
}
