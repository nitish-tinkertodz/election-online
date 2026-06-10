type VoteStateMessageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function VoteStateMessage({
  eyebrow,
  title,
  description
}: VoteStateMessageProps) {
  return (
    <section className="rounded-[2rem] border border-ink/10 bg-white/75 p-10 shadow-card backdrop-blur">
      <p className="font-body text-sm uppercase tracking-[0.3em] text-forest">
        {eyebrow}
      </p>
      <h1 className="mt-4 font-display text-4xl text-ink">{title}</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-ink/70">
        {description}
      </p>
    </section>
  );
}
