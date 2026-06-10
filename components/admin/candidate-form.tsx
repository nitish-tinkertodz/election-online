type CandidateFormProps = {
  previewName?: string;
  previewClassName?: string;
  previewRoleName?: string;
  isClassLeader?: boolean;
  classLabel?: string;
  divisionLabel?: string;
};

export function CandidateForm({
  previewName = "Candidate name",
  previewClassName = "Class details",
  previewRoleName = "Role",
  isClassLeader = false,
  classLabel = "Class",
  divisionLabel = "Division"
}: CandidateFormProps) {
  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/70 p-6 shadow-card backdrop-blur">
      <h2 className="font-display text-2xl text-ink">Candidate form</h2>
      {isClassLeader ? (
        <p className="mt-2 text-sm text-forest">
          This candidate belongs to a class leader role, so class and division details are shown here.
        </p>
      ) : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Candidate name</span>
          <input
            defaultValue={previewName}
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">{classLabel}</span>
          <input
            defaultValue={previewClassName}
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">{divisionLabel}</span>
          <input
            defaultValue={previewRoleName}
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
          />
        </label>
        <div className="rounded-2xl border border-dashed border-ink/15 bg-cream px-4 py-6 text-sm text-ink/60">
          Photo placeholder
        </div>
      </div>
    </section>
  );
}
