"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ResultsSnapshot } from "@/lib/results/live-results";

type Role = {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  status: "Active" | "Inactive";
};

type Candidate = {
  id: string;
  role_id: string;
  name: string;
  class_name: string;
  photo_url?: string;
  status: "Active" | "Inactive";
};

type AdminDashboardProps = {
  roles: Role[];
  candidates: Candidate[];
  status: string;
};

type RoleFormState = {
  id: string;
  name: string;
  description: string;
  display_order: string;
  status: Role["status"];
};

type CandidateFormState = {
  id: string;
  role_id: string;
  name: string;
  class_name: string;
  photo_url: string;
  status: Candidate["status"];
};

type IconActionButtonProps = {
  label: string;
  tone?: "default" | "danger";
  onClick: () => void;
};

type ActiveEditor = "role" | "candidate" | null;

const emptyRoleForm = (): RoleFormState => ({
  id: "",
  name: "",
  description: "",
  display_order: "1",
  status: "Active"
});

const emptyCandidateForm = (roleId = ""): CandidateFormState => ({
  id: "",
  role_id: roleId,
  name: "",
  class_name: "",
  photo_url: "",
  status: "Active"
});

async function saveJson(url: string, method: "POST" | "PUT" | "DELETE", body: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to save record.");
  }

  return payload;
}

async function uploadCandidatePhoto(candidateId: string, photo: File) {
  const formData = new FormData();
  formData.append("photo", photo);

  const response = await fetch(`/api/candidates/${candidateId}/photo`, {
    method: "POST",
    body: formData
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    photo_url?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to upload photo.");
  }

  return payload;
}

async function fetchOfficialResults() {
  const response = await fetch("/api/results", {
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
    generatedAt?: string;
    closedAt?: string | null;
    summary?: { total_votes_cast: number };
    roles?: ResultsSnapshot["roles"];
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "Unable to load official results.");
  }

  return {
    election_status: "CLOSED" as const,
    generated_at: payload.generatedAt ?? new Date().toISOString(),
    closed_at: payload.closedAt ?? null,
    summary: payload.summary ?? { total_votes_cast: 0 },
    roles: payload.roles ?? []
  };
}

function IconActionButton({
  label,
  tone = "default",
  onClick
}: IconActionButtonProps) {
  const isDanger = tone === "danger";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
        isDanger
          ? "border-red-200 text-red-700 hover:border-red-400 hover:bg-red-50"
          : "border-ink/15 text-ink hover:border-ink/40 hover:bg-white"
      }`}
    >
      {label === "Edit" ? (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      )}
      <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream opacity-0 shadow-sm transition group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

export function AdminDashboard({ roles, candidates, status }: AdminDashboardProps) {
  const router = useRouter();
  const roleFormRef = useRef<HTMLFormElement | null>(null);
  const candidateFormRef = useRef<HTMLFormElement | null>(null);
  const roleNameInputRef = useRef<HTMLInputElement | null>(null);
  const candidateNameInputRef = useRef<HTMLInputElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeEditor, setActiveEditor] = useState<ActiveEditor>(null);
  const [isResettingElection, setIsResettingElection] = useState(false);
  const [officialResults, setOfficialResults] = useState<ResultsSnapshot | null>(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [roleForm, setRoleForm] = useState<RoleFormState>(emptyRoleForm());
  const [candidateForm, setCandidateForm] = useState<CandidateFormState>(
    emptyCandidateForm(roles[0]?.id ?? "")
  );

  const rolesById = useMemo(
    () => new Map(roles.map((role) => [role.id, role])),
    [roles]
  );

  const candidatesByRole = useMemo(() => {
    return roles.map((role) => ({
      role,
      items: candidates.filter((candidate) => candidate.role_id === role.id)
    }));
  }, [candidates, roles]);
  const hasReadyBallot = useMemo(() => {
    const activeRoleIds = new Set(
      roles.filter((role) => role.status === "Active").map((role) => role.id)
    );

    return candidates.some(
      (candidate) =>
        candidate.status === "Active" && activeRoleIds.has(candidate.role_id)
    );
  }, [candidates, roles]);

  function editRole(role: Role) {
    setError("");
    setMessage("");
    setActiveEditor("role");
    setRoleForm({
      id: role.id,
      name: role.name,
      description: role.description ?? "",
      display_order: String(role.display_order),
      status: role.status
    });
    window.requestAnimationFrame(() => {
      roleFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        roleNameInputRef.current?.focus();
        roleNameInputRef.current?.select();
      }, 250);
    });
  }

  function editCandidate(candidate: Candidate) {
    setError("");
    setMessage("");
    setActiveEditor("candidate");
    setCandidateForm({
      id: candidate.id,
      role_id: candidate.role_id,
      name: candidate.name,
      class_name: candidate.class_name,
      photo_url: candidate.photo_url ?? "",
      status: candidate.status
    });
    window.requestAnimationFrame(() => {
      candidateFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        candidateNameInputRef.current?.focus();
        candidateNameInputRef.current?.select();
      }, 250);
    });
  }

  async function submitRoleForm(formData: FormData) {
    setError("");
    setMessage("");

    const payload = {
      id: roleForm.id || undefined,
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      display_order: Number(formData.get("display_order") ?? 1),
      status: String(formData.get("status") ?? "Active")
    };

    await saveJson(payload.id ? "/api/roles" : "/api/roles", payload.id ? "PUT" : "POST", payload);
    setMessage(payload.id ? "Role updated." : "Role created.");
    setActiveEditor(null);
    setRoleForm(emptyRoleForm());
    startTransition(() => router.refresh());
  }

  async function submitCandidateForm(formData: FormData) {
    setError("");
    setMessage("");

    const photo = formData.get("photo");

    const payload = {
      id: candidateForm.id || undefined,
      role_id: String(formData.get("role_id") ?? ""),
      name: String(formData.get("name") ?? ""),
      class_name: String(formData.get("class_name") ?? ""),
      photo_url: candidateForm.photo_url,
      status: String(formData.get("status") ?? "Active")
    };

    const result = (await saveJson(
      payload.id ? "/api/candidates" : "/api/candidates",
      payload.id ? "PUT" : "POST",
      payload
    )) as { item?: { id: string } };

    if (photo instanceof File && photo.size > 0 && result.item?.id) {
      const uploadResult = await uploadCandidatePhoto(result.item.id, photo);
      payload.photo_url = uploadResult.photo_url ?? payload.photo_url;
    }

    setMessage(payload.id ? "Candidate updated." : "Candidate created.");
    setActiveEditor(null);
    setCandidateForm(emptyCandidateForm(roles[0]?.id ?? ""));
    startTransition(() => router.refresh());
  }

  async function startBallot() {
    setError("");
    setMessage("");

    await saveJson("/api/election/open", "POST", {});
    setMessage("Ballot started.");
    startTransition(() => router.refresh());
  }

  async function closeBallot() {
    setError("");
    setMessage("");

    await saveJson("/api/election/close", "POST", {});
    const resultsSnapshot = await fetchOfficialResults();
    setOfficialResults(resultsSnapshot);
    setIsResultsModalOpen(true);
    setMessage("Ballot closed. Official winners are ready.");
    startTransition(() => router.refresh());
  }

  async function resetElectionState() {
    setError("");
    setMessage("");
    setIsResettingElection(true);

    try {
      await saveJson("/api/election/reset", "POST", {});
      window.location.reload();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reset the election."
      );
      setIsResettingElection(false);
    }
  }

  async function removeRole(role: Role) {
    if (!window.confirm(`Delete the role "${role.name}" and all its candidates?`)) {
      return;
    }

    setError("");
    setMessage("");

    await saveJson("/api/roles", "DELETE", { id: role.id });
    if (roleForm.id === role.id) {
      setActiveEditor(null);
      setRoleForm(emptyRoleForm());
    }
    setMessage("Role removed.");
    startTransition(() => router.refresh());
  }

  async function removeCandidate(candidate: Candidate) {
    if (!window.confirm(`Delete candidate "${candidate.name}"?`)) {
      return;
    }

    setError("");
    setMessage("");

    await saveJson("/api/candidates", "DELETE", { id: candidate.id });
    if (candidateForm.id === candidate.id) {
      setActiveEditor(null);
      setCandidateForm(emptyCandidateForm(roles[0]?.id ?? ""));
    }
    setMessage("Candidate removed.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-ink/10 bg-white/80 p-8 shadow-card backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-ink/48">
              Election status
            </p>
            <p className="mt-2 font-display text-3xl text-ink">{status}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-ember/15 bg-ember/10 px-4 py-2 text-sm font-semibold text-ember">
              Admin setup enabled while not open
            </div>
            {status === "OPEN" ? (
              <>
                <div className="rounded-full border border-forest/15 bg-forest/10 px-4 py-2 text-sm font-semibold text-forest">
                  Ballot is open
                </div>
                <button
                  type="button"
                  onClick={closeBallot}
                  disabled={isPending}
                  className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Closing..." : "Close ballot"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={startBallot}
                  disabled={isPending || !hasReadyBallot}
                  className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Starting..." : "Start ballot"}
                </button>
                {!hasReadyBallot ? (
                  <p className="text-sm text-ink/65">
                    Add an active candidate before opening the ballot.
                  </p>
                ) : null}
              </>
            )}
            {status === "CLOSED" ? (
              <button
                type="button"
                onClick={() => {
                  startTransition(() => {
                    router.push("/results");
                  });
                }}
                className="rounded-full border border-forest/20 bg-forest/10 px-4 py-2 text-sm font-semibold text-forest transition hover:border-forest/40"
              >
                View results
              </button>
            ) : null}
            <button
              type="button"
              onClick={resetElectionState}
              disabled={isPending || isResettingElection}
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResettingElection ? "Resetting..." : "Reset election"}
            </button>
          </div>
        </div>
        {message ? <p className="mt-4 text-sm text-forest">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          ref={roleFormRef}
          action={submitRoleForm}
          className={`rounded-[2rem] border bg-white/80 p-6 shadow-card backdrop-blur transition ${
            activeEditor === "role"
              ? "border-forest ring-2 ring-forest/20"
              : "border-ink/10"
          }`}
        >
          <h2 className="font-display text-3xl text-ink">
            {roleForm.id ? "Edit role" : "Create role"}
          </h2>
          <input type="hidden" name="id" value={roleForm.id} />
          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Name</span>
              <input
                ref={roleNameInputRef}
                name="name"
                value={roleForm.name}
                onChange={(event) =>
                  setRoleForm((current) => ({
                    ...current,
                    name: event.target.value
                  }))
                }
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Description</span>
              <input
                name="description"
                value={roleForm.description}
                onChange={(event) =>
                  setRoleForm((current) => ({
                    ...current,
                    description: event.target.value
                  }))
                }
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Display order</span>
                <input
                  name="display_order"
                  type="number"
                  value={roleForm.display_order}
                  onChange={(event) =>
                    setRoleForm((current) => ({
                      ...current,
                      display_order: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Status</span>
                <select
                  name="status"
                  value={roleForm.status}
                  onChange={(event) =>
                    setRoleForm((current) => ({
                      ...current,
                      status: event.target.value as Role["status"]
                    }))
                  }
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition hover:bg-forest disabled:opacity-60"
              >
                {roleForm.id ? "Update role" : "Create role"}
              </button>
              {roleForm.id ? (
                <button
                  type="button"
                  onClick={() => setRoleForm(emptyRoleForm())}
                  className="rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <form
          ref={candidateFormRef}
          action={submitCandidateForm}
          className={`rounded-[2rem] border bg-white/80 p-6 shadow-card backdrop-blur transition ${
            activeEditor === "candidate"
              ? "border-forest ring-2 ring-forest/20"
              : "border-ink/10"
          }`}
        >
          <h2 className="font-display text-3xl text-ink">
            {candidateForm.id ? "Edit candidate" : "Create candidate"}
          </h2>
          <input type="hidden" name="id" value={candidateForm.id} />
          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Role</span>
              <select
                name="role_id"
                value={candidateForm.role_id}
                onChange={(event) =>
                  setCandidateForm((current) => ({
                    ...current,
                    role_id: event.target.value
                  }))
                }
                disabled={roles.length === 0}
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
              >
                {roles.length === 0 ? (
                  <option value="">Create a role first</option>
                ) : (
                  roles.map((role) => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Name</span>
                <input
                  ref={candidateNameInputRef}
                  name="name"
                  value={candidateForm.name}
                  onChange={(event) =>
                    setCandidateForm((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">
                  Class <span className="font-normal text-ink/55">(optional)</span>
                </span>
                <input
                  name="class_name"
                  value={candidateForm.class_name}
                  onChange={(event) =>
                    setCandidateForm((current) => ({
                      ...current,
                      class_name: event.target.value
                    }))
                  }
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Photo</span>
              <input
                name="photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:font-semibold file:text-cream hover:file:opacity-90"
              />
              {candidateForm.photo_url ? (
                <p className="mt-2 text-sm text-ink/60">
                  Existing photo saved for this candidate.
                </p>
              ) : null}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Status</span>
              <select
                name="status"
                value={candidateForm.status}
                onChange={(event) =>
                  setCandidateForm((current) => ({
                    ...current,
                    status: event.target.value as Candidate["status"]
                  }))
                }
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition hover:bg-forest disabled:opacity-60"
              >
                {candidateForm.id ? "Update candidate" : "Create candidate"}
              </button>
              {candidateForm.id ? (
                <button
                  type="button"
                  onClick={() => setCandidateForm(emptyCandidateForm(roles[0]?.id ?? ""))}
                  className="rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </section>

      <section className="grid gap-6">
        {roles.length === 0 ? (
          <div className="rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-card backdrop-blur">
            <p className="text-sm leading-6 text-ink/68">
              No roles have been added yet. Create a role first, then add candidates to it.
            </p>
          </div>
        ) : null}
        {candidatesByRole.map(({ role, items }) => (
          <article
            key={role.id}
            className="rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-card backdrop-blur"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl text-ink">{role.name}</h2>
                <p className="mt-2 text-sm text-ink/68">
                  {role.description || "No description provided."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <IconActionButton
                  label="Edit"
                  onClick={() => editRole(role)}
                />
                <IconActionButton
                  label="Delete"
                  tone="danger"
                  onClick={() => void removeRole(role)}
                />
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((candidate) => (
                <div
                  key={candidate.id}
                  className="rounded-[1.5rem] border border-ink/10 bg-cream/60 p-4"
                >
                  <div className="overflow-hidden rounded-[1.25rem] border border-dashed border-ink/15 bg-white">
                    <div className="flex aspect-square w-full items-center justify-center bg-ballot-glow">
                    {candidate.photo_url ? (
                      <img
                        src={candidate.photo_url}
                        alt={candidate.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs uppercase tracking-[0.22em] text-ink/45">
                        No photo
                      </span>
                    )}
                    </div>
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.22em] text-ember">
                    {candidate.status}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-ink">{candidate.name}</h3>
                  <p className="mt-1 text-sm text-ink/68">{candidate.class_name}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <IconActionButton
                      label="Edit"
                      onClick={() => editCandidate(candidate)}
                    />
                    <IconActionButton
                      label="Delete"
                      tone="danger"
                      onClick={() => void removeCandidate(candidate)}
                    />
                  </div>
                </div>
              ))}
            </div>
            {items.length === 0 ? (
              <p className="mt-4 text-sm text-ink/60">No candidates yet.</p>
            ) : null}
          </article>
        ))}
      </section>

      {isResultsModalOpen && officialResults ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-forest">
                  Official winners
                </p>
                <h2 className="mt-2 font-display text-3xl text-ink">
                  Role-by-role results
                </h2>
                <p className="mt-2 text-sm text-ink/68">
                  Total votes cast: {officialResults.summary.total_votes_cast}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsResultsModalOpen(false);
                    startTransition(() => {
                      router.push("/results");
                    });
                  }}
                  className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink/40"
                >
                  Full results
                </button>
                <button
                  type="button"
                  onClick={() => setIsResultsModalOpen(false)}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition hover:bg-forest"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="max-h-[calc(90vh-112px)] overflow-y-auto px-6 py-6">
              <div className="grid gap-5">
                {officialResults.roles.map((role) => {
                  const winner =
                    role.candidates.find((candidate) => candidate.is_winner) ?? null;

                  return (
                    <section
                      key={role.role_id}
                      className="rounded-[1.6rem] border border-ink/10 bg-cream/55 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-ink/48">
                            Role
                          </p>
                          <h3 className="mt-2 font-display text-2xl text-ink">
                            {role.role_name}
                          </h3>
                          <p className="mt-2 text-sm text-ink/68">
                            {role.is_tie
                              ? "Tie detected for this role."
                              : winner
                                ? `Winner: ${winner.candidate_name}`
                                : "No winner recorded."}
                          </p>
                        </div>
                        <div className="rounded-[1.2rem] border border-forest/15 bg-white px-4 py-3 text-right">
                          <p className="text-xs uppercase tracking-[0.22em] text-ink/48">
                            Votes
                          </p>
                          <p className="mt-2 font-display text-2xl text-ink">
                            {role.total_votes}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {role.candidates.map((candidate) => (
                          <div
                            key={candidate.candidate_id}
                            className="rounded-[1.25rem] border border-ink/10 bg-white/80 p-4"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex aspect-square w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-dashed border-ink/15 bg-ballot-glow text-[10px] uppercase tracking-[0.22em] text-ink/45">
                                {candidate.photo_url ? (
                                  <img
                                    src={candidate.photo_url}
                                    alt={candidate.candidate_name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  "Photo"
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-display text-xl text-ink">
                                    {candidate.candidate_name}
                                  </h4>
                                  {candidate.is_winner ? (
                                    <span className="rounded-full bg-forest/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-forest">
                                      Winner
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 text-sm text-ink/68">
                                  {candidate.class_name}
                                </p>
                                <div className="mt-3 flex items-center justify-between text-sm text-ink/68">
                                  <span>Vote count</span>
                                  <span className="font-semibold text-ink">
                                    {candidate.vote_count}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
