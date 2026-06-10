import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getElectionStatus } from "@/lib/election/election-service";
import {
  listCandidates,
  type CandidateRecord
} from "@/lib/candidates/candidate-repository";
import { listRoles, type RoleRecord } from "@/lib/roles/role-repository";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { BrandingForm } from "@/components/admin/branding-form";
import {
  getSchoolBranding,
  isSchoolBrandingConfigured
} from "@/lib/branding/branding-service";

type AdminPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

function SetupScreen({ branding }: { branding: Awaited<ReturnType<typeof getSchoolBranding>> }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-ink/10 bg-white/80 p-8 shadow-card backdrop-blur sm:p-10">
          <p className="font-body text-sm uppercase tracking-[0.3em] text-ember">
            School setup
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-ink">
            Set the school banner before you start the election.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/72">
            Add the school name and logo here first. Once saved, the same banner will appear on the admin page, voter page, and results page.
          </p>
        </section>

        <section>
          <BrandingForm
            schoolName={branding.school_name}
            schoolLogoUrl={branding.school_logo_url}
          />
        </section>
      </div>
    </main>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  const branding = await getSchoolBranding();
  const configured = await isSchoolBrandingConfigured();

  const authenticated = await isAdminAuthenticated();
  const status = authenticated ? await getElectionStatus().catch(() => "NOT_STARTED") : "NOT_STARTED";

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
        <section className="w-full max-w-2xl rounded-[2rem] border border-ink/10 bg-white/80 p-10 shadow-card backdrop-blur">
          <p className="font-body text-sm uppercase tracking-[0.3em] text-ember">
            Admin Access
          </p>
          <h1 className="mt-4 font-display text-4xl text-ink">
            {configured ? "Enter the shared admin password." : "Set up the school banner first."}
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/70">
            {configured
              ? "This version uses a temporary shared password gate for protected election controls."
              : "Before anyone logs in, use first time setup to save the school name and logo. After that, the regular admin login becomes available."}
          </p>
          {!configured ? (
            <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-900">
                First time setup
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                This school has not been configured yet. Use the setup page to add the school name and logo.
              </p>
              <a
                href="/"
                className="mt-4 inline-flex rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
              >
                Open setup page
              </a>
            </div>
          ) : null}
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
      <section className="mb-8">
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
      </section>

      <section className="mb-8">
        <BrandingForm
          schoolName={branding.school_name}
          schoolLogoUrl={branding.school_logo_url}
        />
      </section>

      <AdminDashboard
        roles={roles}
        candidates={candidates}
        status={status}
      />
    </main>
  );
}
