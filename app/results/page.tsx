export default function ResultsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
      <section className="rounded-[2rem] border border-ink/10 bg-white/75 p-10 shadow-card backdrop-blur">
        <p className="font-body text-sm uppercase tracking-[0.3em] text-brass">
          Results Dashboard
        </p>
        <h1 className="mt-4 font-display text-4xl text-ink">
          Results scaffolding is ready.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70">
          Live standings and final official results will render here after the
          shared results layer is connected.
        </p>
      </section>
    </main>
  );
}
