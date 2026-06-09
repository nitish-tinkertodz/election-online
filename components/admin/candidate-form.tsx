type CandidateFormProps = {
  previewName?: string;
  previewClassName?: string;
  previewRoleName?: string;
};

export function CandidateForm({
  previewName = "Candidate name",
  previewClassName = "Class details",
  previewRoleName = "Role"
}: CandidateFormProps) {
  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/70 p-6 shadow-card backdrop-blur">
      <h2 className="font-display text-2xl text-ink">Candidate form</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Candidate name</span>
          <input
            defaultValue={previewName}
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Class details</span>
          <input
            defaultValue={previewClassName}
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Role</span>
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
