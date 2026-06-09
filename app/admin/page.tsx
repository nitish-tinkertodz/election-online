import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getElectionStatus } from "@/lib/election/election-service";

type AdminPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  const authenticated = await isAdminAuthenticated();
  const status = authenticated ? await getElectionStatus().catch(() => "NOT_STARTED") : "NOT_STARTED";

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
        <section className="w-full max-w-xl rounded-[2rem] border border-ink/10 bg-white/80 p-10 shadow-card backdrop-blur">
          <p className="font-body text-sm uppercase tracking-[0.3em] text-ember">
            Admin Access
          </p>
          <h1 className="mt-4 font-display text-4xl text-ink">
            Enter the shared admin password.
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/70">
            This version uses a temporary shared password gate for protected
            election controls.
          </p>
          {params.error === "invalid-password" ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              The password was incorrect. Please try again.
            </p>
          ) : null}
          <form action="/api/auth/login" method="post" className="mt-8 space-y-4">
            <input type="hidden" name="next" value={params.next ?? "/admin"} />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">
                Password
              </span>
              <input
                name="password"
                type="password"
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-base outline-none transition focus:border-ember"
                placeholder="Enter shared password"
                required
              />
            </label>
            <button
              type="submit"
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition hover:bg-forest"
            >
              Unlock admin dashboard
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-ink/10 bg-white/80 p-10 shadow-card backdrop-blur">
          <p className="font-body text-sm uppercase tracking-[0.3em] text-ember">
            Admin Dashboard
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-ink">
            Shape the ballot, then open the room.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/72">
            This dashboard is now protected and ready for role, candidate,
            branding, and election lifecycle wiring on top of the shared admin
            access flow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-forest/15 bg-forest/10 px-4 py-2 text-sm font-semibold text-forest">
              Election status: {status}
            </span>
            <span className="rounded-full border border-ember/15 bg-ember/10 px-4 py-2 text-sm font-semibold text-ember">
              Shared password protected
            </span>
          </div>
        </div>
        <div className="rounded-[2rem] border border-ink/10 bg-white/80 p-8 shadow-card backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ink/55">
            Session
          </p>
          <p className="mt-4 text-base leading-7 text-ink/72">
            The temporary shared admin password is active for this version.
            Results and admin controls now sit behind the same cookie-based
            session gate.
          </p>
          <form action="/api/auth/logout" method="post" className="mt-6">
            <button
              type="submit"
              className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink/40"
            >
              Log out
            </button>
          </form>
        </div>
      </section>
      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Roles",
            description: "Create, order, and manage election positions."
          },
          {
            title: "Candidates",
            description: "Manage candidate details, photos, and active status."
          },
          {
            title: "Branding",
            description: "Control school identity, logo, and public-facing feel."
          },
          {
            title: "Election lifecycle",
            description: "Open and close the election with final snapshot protection."
          }
        ].map((panel) => (
          <article
            key={panel.title}
            className="rounded-[1.75rem] border border-ink/10 bg-white/70 p-6 shadow-card backdrop-blur"
          >
            <h2 className="font-display text-2xl text-ink">{panel.title}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/68">{panel.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
