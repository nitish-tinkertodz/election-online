type StatePanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  tone?: "neutral" | "warning" | "danger" | "success";
};

export function StatePanel({
  eyebrow,
  title,
  description,
  tone = "neutral"
}: StatePanelProps) {
  const toneClass =
    tone === "success"
      ? "text-forest"
      : tone === "warning"
        ? "text-brass"
        : tone === "danger"
          ? "text-red-700"
          : "text-ink/55";

  return (
    <section className="rounded-[2rem] border border-ink/10 bg-white/80 p-8 shadow-card backdrop-blur">
      <p className={`font-body text-sm uppercase tracking-[0.3em] ${toneClass}`}>
        {eyebrow}
      </p>
      <h1 className="mt-4 font-display text-4xl text-ink">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-ink/70">
        {description}
      </p>
    </section>
  );
}
