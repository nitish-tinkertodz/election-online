type BrandingFormProps = {
  schoolName?: string;
  logoUrl?: string;
};

export function BrandingForm({
  schoolName = "School Election Voting System",
  logoUrl = ""
}: BrandingFormProps) {
  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/70 p-6 shadow-card backdrop-blur">
      <h2 className="font-display text-2xl text-ink">Branding</h2>
      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">School name</span>
          <input
            defaultValue={schoolName}
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">Logo URL</span>
          <input
            defaultValue={logoUrl}
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
          />
        </label>
      </div>
    </section>
  );
}
