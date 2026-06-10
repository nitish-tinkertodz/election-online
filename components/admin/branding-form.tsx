"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BrandingFormProps = {
  schoolName: string;
  schoolLogoUrl: string;
};

type FormState = {
  school_name: string;
  school_logo_url: string;
};

export function BrandingForm({
  schoolName,
  schoolLogoUrl
}: BrandingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formState, setFormState] = useState<FormState>({
    school_name: schoolName,
    school_logo_url: schoolLogoUrl
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      let uploadedLogoUrl = formState.school_logo_url;

      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);

        const uploadResponse = await fetch("/api/branding/logo", {
          method: "POST",
          body: formData
        });

        const uploadPayload = (await uploadResponse.json().catch(() => ({}))) as {
          message?: string;
          logo_url?: string;
        };

        if (!uploadResponse.ok) {
          throw new Error(uploadPayload.message ?? "Unable to upload logo.");
        }

        uploadedLogoUrl = uploadPayload.logo_url ?? "/api/branding/logo";
      }

      const response = await fetch("/api/branding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formState,
          school_logo_url: uploadedLogoUrl
        })
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to update branding.");
      }

      setMessage("Branding updated successfully.");
      setLogoFile(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update branding."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border border-ink/10 bg-white/80 p-6 shadow-card backdrop-blur"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ember">
            Custom branding
          </p>
          <h2 className="mt-2 font-display text-2xl text-ink">
            School banner settings
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/68">
            Update the school name and upload the logo file once, and the same banner will appear on
            the admin, voting, and results screens.
          </p>
        </div>
        <span className="rounded-full border border-forest/15 bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
          Live editable
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">
            School name
          </span>
          <input
            value={formState.school_name}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                school_name: event.target.value
              }))
            }
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-base outline-none transition focus:border-ember"
            placeholder="Enter school name"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink">
            School logo file
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setLogoFile(file);
            }}
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-base outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream focus:border-ember"
          />
          <p className="mt-2 text-xs leading-5 text-ink/52">
            Upload a PNG, JPG, or WEBP file. Leave it empty to keep the existing logo.
          </p>
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save branding"}
          </button>
          {message ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium text-forest">{message}</p>
              <Link
                href="/admin"
                className="rounded-full border border-forest/20 bg-forest/10 px-4 py-2 text-sm font-semibold text-forest transition hover:bg-forest/15"
              >
                Continue to admin login
              </Link>
            </div>
          ) : null}
          {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        </div>
      </div>
    </form>
  );
}
