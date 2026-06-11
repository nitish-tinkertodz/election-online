"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SchoolBrand } from "@/components/shared/school-brand";

const BRANDING_FORM_COLLAPSED_KEY = "admin-branding-form-collapsed";

type BrandingFormProps = {
  schoolName: string;
  logoUrl?: string;
};

export function BrandingForm({
  schoolName,
  logoUrl = ""
}: BrandingFormProps) {
  const router = useRouter();
  const [name, setName] = useState(schoolName);
  const [previewUrl, setPreviewUrl] = useState(logoUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setIsCollapsed(
      window.localStorage.getItem(BRANDING_FORM_COLLAPSED_KEY) === "true"
    );
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function submitBranding(formData: FormData) {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/branding", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        school_logo_url?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to save school branding.");
      }

      setPreviewUrl(payload.school_logo_url ?? "");
      setMessage("School name and logo saved.");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save school branding."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function toggleCollapsed() {
    setIsCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(BRANDING_FORM_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  return (
    <section className="rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-card backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ember">
            School identity
          </p>
          <h2 className="mt-2 font-display text-3xl text-ink">Name and logo</h2>
        </div>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? "Show school identity form" : "Hide school identity form"}
          title={isCollapsed ? "Show school identity form" : "Hide school identity form"}
          className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition hover:border-ink/40 hover:bg-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {isCollapsed ? <path d="m9 18 6-6-6-6" /> : <path d="m6 9 6 6 6-6" />}
          </svg>
          <span className="pointer-events-none absolute -top-10 right-0 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream opacity-0 shadow-sm transition group-hover:opacity-100">
            {isCollapsed ? "Show form" : "Hide form"}
          </span>
        </button>
      </div>

      {!isCollapsed ? (
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <form action={submitBranding}>
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">
                School name
              </span>
              <input
                name="school_name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={140}
                required
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">
                School logo
              </span>
              <input
                name="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:font-semibold file:text-cream"
              />
              <p className="mt-2 text-xs text-ink/55">
                PNG, JPEG, or WebP. Maximum size 5 MB.
              </p>
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="w-fit rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition hover:bg-forest disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save school identity"}
            </button>
            {message ? <p className="text-sm text-forest">{message}</p> : null}
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </div>
        </form>
        <div className="rounded-[1.5rem] border border-dashed border-ink/15 bg-cream/60 p-5">
          <p className="mb-4 text-xs uppercase tracking-[0.22em] text-ink/48">
            Header preview
          </p>
          <SchoolBrand
            schoolName={name || "School Election Voting System"}
            logoUrl={previewUrl}
          />
        </div>
      </div>
      ) : null}
    </section>
  );
}
