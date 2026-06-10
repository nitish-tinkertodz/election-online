import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getElectionStatus } from "@/lib/election/election-service";
import {
  listCandidates,
  type CandidateRecord
} from "@/lib/candidates/candidate-repository";
import { listRoles, type RoleRecord } from "@/lib/roles/role-repository";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

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
          {params.error === "admin-session-active" ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Another admin session is already active on this network. Close that session or wait for it to expire before signing in here.
            </p>
          ) : null}
          {params.error === "login-failed" ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              The admin session could not be started. Please try again.
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

  const [roles, candidates]: [RoleRecord[], CandidateRecord[]] = await Promise.all([
    listRoles(),
    listCandidates()
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16">
      <section className="mb-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-ink/10 bg-white/80 p-10 shadow-card backdrop-blur">
          <p className="font-body text-sm uppercase tracking-[0.3em] text-ember">
            Admin Dashboard
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-ink">
            Shape the ballot, then open the room.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/72">
            Create and manage roles and candidates here before starting the election.
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

      <AdminDashboard
        roles={roles}
        candidates={candidates}
        status={status}
      />
    </main>
  );
}
