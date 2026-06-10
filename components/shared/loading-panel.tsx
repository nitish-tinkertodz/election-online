type LoadingPanelProps = {
  label: string;
};

export function LoadingPanel({ label }: LoadingPanelProps) {
  return (
    <section className="rounded-[2rem] border border-ink/10 bg-white/80 p-8 shadow-card backdrop-blur">
      <p className="font-body text-sm uppercase tracking-[0.3em] text-ink/55">
        Loading
      </p>
      <h1 className="mt-4 font-display text-4xl text-ink">{label}</h1>
      <div className="mt-6 space-y-3">
        <div className="h-4 w-48 animate-pulse rounded-full bg-ink/10" />
        <div className="h-4 w-full animate-pulse rounded-full bg-ink/10" />
        <div className="h-4 w-5/6 animate-pulse rounded-full bg-ink/10" />
      </div>
    </section>
  );
}
