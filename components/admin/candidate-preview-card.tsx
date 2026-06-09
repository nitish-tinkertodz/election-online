type CandidatePreviewCardProps = {
  name?: string;
  classNameLabel?: string;
  roleName?: string;
};

export function CandidatePreviewCard({
  name = "Candidate name",
  classNameLabel = "Class details",
  roleName = "Role"
}: CandidatePreviewCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-ink/10 bg-white/70 p-6 shadow-card backdrop-blur">
      <div className="flex items-start gap-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-ballot-glow text-center text-xs uppercase tracking-[0.24em] text-ink/55">
          Photo
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-ember">{roleName}</p>
          <h3 className="mt-2 font-display text-2xl text-ink">{name}</h3>
          <p className="mt-2 text-sm text-ink/68">{classNameLabel}</p>
        </div>
      </div>
    </article>
  );
}
