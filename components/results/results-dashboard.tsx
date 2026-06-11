"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { RoleResultsCard } from "@/components/results/role-results-card";
import { ResultsBanner } from "@/components/results/results-banner";
import { SchoolBrand } from "@/components/shared/school-brand";
import type { ResultsRole, ResultsSnapshot } from "@/lib/results/live-results";

type ResultsDashboardData = {
  mode: "live" | "official";
  electionStatus: "OPEN" | "CLOSED";
  generatedAt: string;
  closedAt: string | null;
  summary: {
    total_votes_cast: number;
  };
  roles: ResultsRole[];
};

type ResultsDashboardProps = {
  initialData: ResultsDashboardData;
  schoolName: string;
  logoUrl?: string;
};

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function mapSnapshotToData(
  snapshot: ResultsSnapshot,
  mode: "live" | "official"
): ResultsDashboardData {
  return {
    mode,
    electionStatus: snapshot.election_status,
    generatedAt: snapshot.generated_at,
    closedAt: snapshot.closed_at,
    summary: snapshot.summary,
    roles: snapshot.roles
  };
}

export function ResultsDashboard({
  initialData,
  schoolName,
  logoUrl = ""
}: ResultsDashboardProps) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (data.electionStatus !== "OPEN") {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch("/api/results", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Unable to refresh live results.");
        }

        const payload = (await response.json()) as ResultsDashboardData;
        setData(payload);
        setError("");
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to refresh live results."
        );
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [data.electionStatus]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SchoolBrand schoolName={schoolName} logoUrl={logoUrl} />
        <Link
          href="/admin"
          className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-forest hover:text-forest"
        >
          Back to admin
        </Link>
      </div>
      <div className="mt-8 space-y-6">
        <ResultsBanner
          tone={data.mode}
          title={
            data.mode === "official"
              ? "Official election results"
              : "Live election results"
          }
          description={
            data.mode === "official"
              ? "These results were frozen when the election was closed and will remain unchanged for this record."
              : "These results refresh automatically every 5 seconds while voting remains open."
          }
        />

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.6rem] border border-ink/10 bg-white/80 p-5 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/48">
              Results mode
            </p>
            <p className="mt-3 font-display text-3xl text-ink">
              {data.mode === "official" ? "Official" : "Live"}
            </p>
          </div>
          <div className="rounded-[1.6rem] border border-ink/10 bg-white/80 p-5 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/48">
              Election status
            </p>
            <p className="mt-3 font-display text-3xl text-ink">
              {data.electionStatus}
            </p>
          </div>
          <div className="rounded-[1.6rem] border border-ink/10 bg-white/80 p-5 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/48">
              Last updated
            </p>
            <p className="mt-3 text-sm leading-6 text-ink/68">
              {formatTimestamp(data.generatedAt)}
            </p>
          </div>
          <div className="rounded-[1.6rem] border border-ink/10 bg-white/80 p-5 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/48">
              Voters participated
            </p>
            <p className="mt-3 font-display text-3xl text-ink">
              {data.summary.total_votes_cast}
            </p>
          </div>
        </section>

        {data.mode === "official" ? (
          <div className="rounded-[1.6rem] border border-ink/10 bg-white/80 p-5 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/48">
              Election closed
            </p>
            <p className="mt-3 text-sm leading-6 text-ink/68">
              {formatTimestamp(data.closedAt)}
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6">
          {data.roles.map((role) => (
            <RoleResultsCard
              key={role.role_id}
              role={role}
              mode={data.mode}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
