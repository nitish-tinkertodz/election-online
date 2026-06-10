type Candidate = {
  id: string;
  name: string;
  class_name: string;
  photo_url: string;
};

type RoleCardProps = {
  role: {
    id: string;
    name: string;
    candidates: Candidate[];
  };
};

export function RoleCard({ role }: RoleCardProps) {
  return (
    <section className="rounded-[2.25rem] border border-ink/10 bg-white/80 p-8 shadow-card backdrop-blur">
      <h1 className="font-display text-4xl text-ink">{role.name}</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {role.candidates.map((candidate) => (
          <label
            key={candidate.id}
            className="group block h-full cursor-pointer"
          >
            <input
              type="radio"
              name="candidate_id"
              value={candidate.id}
              className="peer sr-only"
              required
            />
            <div className="flex h-full gap-4 rounded-[1.75rem] border border-ink/10 bg-cream/70 p-4 transition hover:border-ember hover:bg-white peer-checked:border-forest peer-checked:bg-white peer-checked:ring-2 peer-checked:ring-forest/20">
              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-ink/25 bg-white transition group-hover:border-ember peer-checked:border-forest">
                <span className="h-2.5 w-2.5 rounded-full bg-forest opacity-0 transition peer-checked:opacity-100" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex h-20 w-full items-center justify-center rounded-[1.4rem] border border-dashed border-ink/15 bg-white text-[10px] uppercase tracking-[0.22em] text-ink/50 sm:h-24">
                  {candidate.photo_url ? "Photo" : "Placeholder"}
                </div>
                <div className="min-w-0">
                  <h2 className="break-words font-display text-2xl text-ink">
                    {candidate.name}
                  </h2>
                  <p className="mt-2 text-sm text-ink/68">{candidate.class_name}</p>
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
