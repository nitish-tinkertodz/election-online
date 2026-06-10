import Link from "next/link";

import { BrandingForm } from "@/components/admin/branding-form";
import { getSchoolBranding } from "@/lib/branding/branding-service";

export default async function HomePage() {
  const branding = await getSchoolBranding();

  return (
    <main className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-6xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-ink/10 bg-white/80 p-8 shadow-card backdrop-blur sm:p-10">
          <p className="font-body text-sm uppercase tracking-[0.3em] text-ember">
            School setup
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-ink">
            Set the school banner before you start the election.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/72">
            Add the school name and logo here first. Once saved, the same banner
            will appear on the admin page, voter page, and results page.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition hover:bg-forest"
            >
              Go to admin login
            </Link>
            <Link
              href="/vote"
              className="rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink/30 hover:bg-white"
            >
              Open voter page
            </Link>
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-ink/10 bg-ink/5 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-ink/48">
              Current banner
            </p>
            <p className="mt-2 font-display text-3xl text-ink">
              {branding.school_name}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              {branding.school_logo_url ? "Logo URL is configured." : "Logo is not set yet."}
            </p>
          </div>
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
