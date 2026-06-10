"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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

async function saveJson(url: string, method: "POST" | "PUT", body: unknown) {
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
}

export function AdminDashboard({ roles, candidates, status }: AdminDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
    setRoleForm({
      id: role.id,
      name: role.name,
      description: role.description ?? "",
      display_order: String(role.display_order),
      status: role.status
    });
  }

  function editCandidate(candidate: Candidate) {
    setError("");
    setMessage("");
    setCandidateForm({
      id: candidate.id,
      role_id: candidate.role_id,
      name: candidate.name,
      class_name: candidate.class_name,
      photo_url: candidate.photo_url ?? "",
      status: candidate.status
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
    setRoleForm(emptyRoleForm());
    startTransition(() => router.refresh());
  }

  async function submitCandidateForm(formData: FormData) {
    setError("");
    setMessage("");

    const payload = {
      id: candidateForm.id || undefined,
      role_id: String(formData.get("role_id") ?? ""),
      name: String(formData.get("name") ?? ""),
      class_name: String(formData.get("class_name") ?? ""),
      photo_url: String(formData.get("photo_url") ?? ""),
      status: String(formData.get("status") ?? "Active")
    };

    await saveJson(
      payload.id ? "/api/candidates" : "/api/candidates",
      payload.id ? "PUT" : "POST",
      payload
    );
    setMessage(payload.id ? "Candidate updated." : "Candidate created.");
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
    setMessage("Ballot closed. Loading official results...");
    startTransition(() => {
      router.push("/results");
      router.refresh();
    });
  }

  async function resetElectionState() {
    setError("");
    setMessage("");

    await saveJson("/api/election/reset", "POST", {});
    setMessage("Election reset. Votes and results were cleared.");
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
              disabled={isPending}
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Resetting..." : "Reset election"}
            </button>
          </div>
        </div>
        {message ? <p className="mt-4 text-sm text-forest">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          action={submitRoleForm}
          className="rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-card backdrop-blur"
        >
          <h2 className="font-display text-3xl text-ink">
            {roleForm.id ? "Edit role" : "Create role"}
          </h2>
          <input type="hidden" name="id" value={roleForm.id} />
          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Name</span>
              <input
                name="name"
                defaultValue={roleForm.name}
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Description</span>
              <input
                name="description"
                defaultValue={roleForm.description}
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Display order</span>
                <input
                  name="display_order"
                  type="number"
                  defaultValue={roleForm.display_order}
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Status</span>
                <select
                  name="status"
                  defaultValue={roleForm.status}
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
          action={submitCandidateForm}
          className="rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-card backdrop-blur"
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
                defaultValue={candidateForm.role_id}
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
                  name="name"
                  defaultValue={candidateForm.name}
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">Class</span>
                <input
                  name="class_name"
                  defaultValue={candidateForm.class_name}
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Photo URL</span>
              <input
                name="photo_url"
                defaultValue={candidateForm.photo_url}
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-ember"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Status</span>
              <select
                name="status"
                defaultValue={candidateForm.status}
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
              <button
                type="button"
                onClick={() => editRole(role)}
                className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink"
              >
                Edit role
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((candidate) => (
                <div
                  key={candidate.id}
                  className="rounded-[1.5rem] border border-ink/10 bg-cream/60 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-ember">
                    {candidate.status}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-ink">{candidate.name}</h3>
                  <p className="mt-1 text-sm text-ink/68">{candidate.class_name}</p>
                  <button
                    type="button"
                    onClick={() => editCandidate(candidate)}
                    className="mt-4 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink"
                  >
                    Edit candidate
                  </button>
                </div>
              ))}
            </div>
            {items.length === 0 ? (
              <p className="mt-4 text-sm text-ink/60">No candidates yet.</p>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
