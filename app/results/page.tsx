import { ResultsDashboard } from "@/components/results/results-dashboard";
import { ResultsBanner } from "@/components/results/results-banner";
import { getElectionStatus } from "@/lib/election/election-service";
import {
  buildLiveResultsSnapshot,
  getOfficialResultsSnapshot
} from "@/lib/results/live-results";

export default async function ResultsPage() {
  const electionStatus = await getElectionStatus();

  if (electionStatus === "NOT_STARTED") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
        <ResultsBanner
          tone="pending"
          title="Results are not available yet."
          description="This admin-only dashboard will show live standings after the election opens and official results after it is closed."
        />
      </main>
    );
  }

  if (electionStatus === "OPEN") {
    const snapshot = await buildLiveResultsSnapshot();

    return (
      <ResultsDashboard
        initialData={{
          mode: "live",
          electionStatus: snapshot.election_status,
          generatedAt: snapshot.generated_at,
          closedAt: snapshot.closed_at,
          summary: snapshot.summary,
          roles: snapshot.roles
        }}
      />
    );
  }

  const snapshot = await getOfficialResultsSnapshot();

  if (!snapshot) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
        <ResultsBanner
          tone="pending"
          title="Official results could not be loaded."
          description="The election is closed, but the final snapshot is not available yet."
        />
      </main>
    );
  }

  return (
    <ResultsDashboard
      initialData={{
        mode: "official",
        electionStatus: snapshot.election_status,
        generatedAt: snapshot.generated_at,
        closedAt: snapshot.closed_at,
        summary: snapshot.summary,
        roles: snapshot.roles
      }}
    />
  );
}
