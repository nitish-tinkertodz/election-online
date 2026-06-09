import { getElectionAvailabilityMessage } from "@/lib/election/status";

export default function VotePage() {
  const status = "NOT_STARTED";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-16">
      <section className="rounded-[2rem] border border-ink/10 bg-white/75 p-10 shadow-card backdrop-blur">
        <p className="font-body text-sm uppercase tracking-[0.3em] text-forest">
          Voter Portal
        </p>
        <h1 className="mt-4 font-display text-4xl text-ink">
          {getElectionAvailabilityMessage(status)}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-ink/70">
          The role-by-role voting flow will appear here when the election state
          is connected to the shared election service.
        </p>
      </section>
    </main>
  );
}
