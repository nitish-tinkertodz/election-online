import type { ResultsRole } from "@/lib/results/live-results";

type RoleResultsCardProps = {
  role: ResultsRole;
  mode?: "live" | "official";
};

export function RoleResultsCard({
  role,
  mode = "official"
}: RoleResultsCardProps) {
  return (
    <section className="rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-card backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ink/48">Role</p>
          <h2 className="mt-2 font-display text-3xl text-ink">{role.role_name}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-ink/48">Votes</p>
          <p className="mt-2 font-display text-3xl text-ink">{role.total_votes}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink/68">
        <span>
          {role.is_tie
            ? "Tie detected for the lead."
            : role.winner_candidate_id
              ? mode === "official"
                ? "Winner recorded."
                : "Current leader shown."
              : "No winning candidate yet."}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {role.candidates.map((candidate) => {
          const isFeatured = candidate.is_winner;

          return (
          <div
            key={candidate.candidate_id}
            className={`rounded-[1.75rem] border transition ${
              isFeatured
                ? "border-forest/30 bg-gradient-to-br from-forest/12 via-white to-ember/10 p-6 shadow-card"
                : "border-ink/10 bg-cream/70 p-4"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 gap-4">
                <div className={`flex aspect-square shrink-0 items-center justify-center overflow-hidden border border-dashed border-ink/15 bg-white text-[10px] uppercase tracking-[0.22em] text-ink/45 ${
                  isFeatured
                    ? "w-28 rounded-[1.5rem] sm:w-36"
                    : "w-20 rounded-[1.25rem]"
                }`}>
                  {candidate.photo_url ? (
                    <img
                      src={candidate.photo_url}
                      alt={candidate.candidate_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "Photo"
                  )}
                </div>
                <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-display text-ink ${
                    isFeatured ? "text-3xl sm:text-4xl" : "text-2xl"
                  }`}>
                    {candidate.candidate_name}
                  </h3>
                  {candidate.is_winner ? (
                    <span className="rounded-full border border-forest/20 bg-forest/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-forest">
                      {mode === "official" ? "Winner" : "Leading"}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-ink/68">{candidate.class_name}</p>
              </div>
              </div>
              <div className={`text-right ${
                isFeatured
                  ? "rounded-2xl border border-forest/15 bg-white/80 px-5 py-4"
                  : ""
              }`}>
                <p className="text-xs uppercase tracking-[0.24em] text-ink/48">
                  {isFeatured ? "Votes" : "Rank"}
                </p>
                <p className={`mt-2 font-display text-ink ${
                  isFeatured ? "text-4xl text-forest" : "text-2xl"
                }`}>
                  {isFeatured ? candidate.vote_count : `#${candidate.rank}`}
                </p>
              </div>
            </div>
            {!isFeatured ? (
              <div className="mt-4 flex items-center justify-between text-sm text-ink/68">
              <span>Vote count</span>
              <span className="font-semibold text-ink">{candidate.vote_count}</span>
              </div>
            ) : null}
          </div>
          );
        })}
      </div>
    </section>
  );
}
