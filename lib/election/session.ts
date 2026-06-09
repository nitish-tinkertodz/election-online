import { cookies } from "next/headers";

export const VOTE_SESSION_COOKIE = "vote_session_key";

function buildSessionKey() {
  return `vote_${crypto.randomUUID()}`;
}

export async function getOrCreateVoteSessionKey() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VOTE_SESSION_COOKIE)?.value;

  if (existing) {
    return existing;
  }

  const sessionKey = buildSessionKey();

  cookieStore.set(VOTE_SESSION_COOKIE, sessionKey, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  return sessionKey;
}

export function serializeCompletedRoles(roleIds: string[]) {
  return JSON.stringify([...new Set(roleIds)]);
}

export function parseCompletedRoles(value: string | null | undefined) {
  if (!value) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function hasCompletedRole(completedRoleIds: string[], roleId: string) {
  return completedRoleIds.includes(roleId);
}
