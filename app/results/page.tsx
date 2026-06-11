import Link from "next/link";

import { ResultsDashboard } from "@/components/results/results-dashboard";
import { ResultsBanner } from "@/components/results/results-banner";
import { getElectionStatus } from "@/lib/election/election-service";
import {
  buildLiveResultsSnapshot,
  getOfficialResultsSnapshot
} from "@/lib/results/live-results";
import { getLocalBranding } from "@/lib/election/local-store";
import { SchoolBrand } from "@/components/shared/school-brand";

export default async function ResultsPage() {
  const electionStatus = await getElectionStatus();
  const branding = await getLocalBranding();

  if (electionStatus === "NOT_STARTED") {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SchoolBrand schoolName={branding.school_name} logoUrl={branding.school_logo_url} />
          <Link
            href="/admin"
            className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-forest hover:text-forest"
          >
            Back to admin
          </Link>
        </div>
        <div className="mt-16">
          <ResultsBanner
            tone="pending"
            title="Results are not available yet."
            description="This admin-only dashboard will show live standings after the election opens and official results after it is closed."
          />
        </div>
      </main>
    );
  }

  if (electionStatus === "OPEN") {
    const snapshot = await buildLiveResultsSnapshot();

    return (
      <ResultsDashboard
        schoolName={branding.school_name}
        logoUrl={branding.school_logo_url}
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
      <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SchoolBrand schoolName={branding.school_name} logoUrl={branding.school_logo_url} />
          <Link
            href="/admin"
            className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-forest hover:text-forest"
          >
            Back to admin
          </Link>
        </div>
        <div className="mt-16">
          <ResultsBanner
            tone="pending"
            title="Official results could not be loaded."
            description="The election is closed, but the final snapshot is not available yet."
          />
        </div>
      </main>
    );
  }

  return (
    <ResultsDashboard
      schoolName={branding.school_name}
      logoUrl={branding.school_logo_url}
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
