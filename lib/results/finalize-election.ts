import { buildLiveResultsSnapshot } from "@/lib/results/live-results";

export async function buildFinalResultsSnapshot() {
  const liveSnapshot = await buildLiveResultsSnapshot();
  const closedAt = new Date().toISOString();

  return {
    ...liveSnapshot,
    election_status: "CLOSED",
    closed_at: closedAt,
    generated_at: closedAt
  };
}
