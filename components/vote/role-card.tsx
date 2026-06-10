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
    description: string;
    candidates: Candidate[];
  };
};

export function RoleCard({ role }: RoleCardProps) {
  return (
    <section className="rounded-[2.25rem] border border-ink/10 bg-white/80 p-8 shadow-card backdrop-blur">
      <div className="flex flex-col gap-2">
        <p className="font-body text-sm uppercase tracking-[0.3em] text-forest">
          Current role
        </p>
        <h1 className="font-display text-4xl text-ink">{role.name}</h1>
        <p className="max-w-2xl text-base leading-7 text-ink/70">
          {role.description}
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {role.candidates.map((candidate) => (
          <label
            key={candidate.id}
            className="group flex cursor-pointer gap-4 rounded-[1.75rem] border border-ink/10 bg-cream/70 p-4 transition hover:border-ember hover:bg-white"
          >
            <input
              type="radio"
              name="candidate_id"
              value={candidate.id}
              className="mt-2 h-4 w-4 border-ink text-ember focus:ring-ember"
              required
            />
            <div className="flex min-w-0 flex-1 gap-4">
              <div className="flex h-20 w-20 flex-none items-center justify-center rounded-[1.4rem] border border-dashed border-ink/15 bg-white text-[10px] uppercase tracking-[0.22em] text-ink/50">
                {candidate.photo_url ? "Photo" : "Placeholder"}
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-2xl text-ink">
                  {candidate.name}
                </h2>
                <p className="mt-2 text-sm text-ink/68">{candidate.class_name}</p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
