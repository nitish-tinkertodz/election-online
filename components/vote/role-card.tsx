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
  selectedCandidateId: string;
  onSelectCandidate: (candidateId: string) => void;
};

export function RoleCard({
  role,
  selectedCandidateId,
  onSelectCandidate
}: RoleCardProps) {
  return (
    <section className="rounded-[2rem] border border-ink/10 bg-white/80 p-5 shadow-card backdrop-blur sm:rounded-[2.25rem] sm:p-8">
      <h1 className="pr-4 font-display text-3xl text-ink sm:text-4xl">{role.name}</h1>

      <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {role.candidates.map((candidate) => (
          <label
            key={candidate.id}
            className="group block h-full cursor-pointer"
          >
            <input
              type="radio"
              name="candidate_id"
              value={candidate.id}
              checked={selectedCandidateId === candidate.id}
              onChange={() => onSelectCandidate(candidate.id)}
              className="peer sr-only"
              required
            />
            <div className="flex h-full flex-col gap-3 rounded-[1.4rem] border border-ink/10 bg-cream/70 p-3 transition hover:border-ember hover:bg-white peer-checked:border-2 peer-checked:border-forest peer-checked:bg-white peer-checked:ring-4 peer-checked:ring-forest/25 sm:gap-4 sm:rounded-[1.75rem] sm:p-4">
              <div className="relative overflow-hidden rounded-[1.15rem] border border-dashed border-ink/15 bg-white sm:rounded-[1.4rem]">
                <div className="absolute left-3 top-3 z-10 rounded-full bg-white/95 p-1 shadow-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink/25 transition group-hover:border-ember peer-checked:border-forest">
                    <div className="h-3 w-3 rounded-full bg-forest opacity-0 transition peer-checked:opacity-100" />
                  </div>
                </div>
                <div className="flex aspect-square w-full items-center justify-center bg-ballot-glow">
                  {candidate.photo_url ? (
                    <img
                      src={candidate.photo_url}
                      alt={candidate.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs uppercase tracking-[0.24em] text-ink/45">
                      No photo
                    </span>
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="break-words font-display text-xl leading-tight text-ink sm:text-2xl">
                  {candidate.name}
                </h2>
                <p className="mt-1 text-sm text-ink/68">{candidate.class_name}</p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
