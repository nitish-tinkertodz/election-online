import { execute, queryFirst } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";
import {
  canCloseElection,
  canOpenElection,
  type ElectionStatus
} from "@/lib/election/status";
import { buildFinalResultsSnapshot } from "@/lib/results/finalize-election";

type ElectionRow = {
  id: string;
  status: ElectionStatus;
  started_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getElection() {
  return queryFirst<ElectionRow>(
    getBindings(),
    "SELECT id, status, started_at, closed_at, created_at, updated_at FROM elections WHERE id = ?;",
    ["default-election"]
  );
}

export async function getElectionStatus() {
  const election = await getElection();
  return election?.status ?? "NOT_STARTED";
}

export async function openElection() {
  const election = await getElection();
  const currentStatus = election?.status ?? "NOT_STARTED";

  if (!canOpenElection(currentStatus)) {
    throw new Error("Election can only be opened from NOT_STARTED.");
  }

  const now = new Date().toISOString();

  await execute(
    getBindings(),
    `UPDATE elections
     SET status = ?, started_at = ?, updated_at = ?
     WHERE id = ?;`,
    ["OPEN", now, now, "default-election"]
  );
  await execute(
    getBindings(),
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);",
    ["election_status", "OPEN"]
  );

  return { status: "OPEN" as const, started_at: now };
}

export async function closeElection() {
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
