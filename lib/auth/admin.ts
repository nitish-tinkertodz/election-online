import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { execute, queryFirst } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";
import {
  getLocalAdminSessionLock,
  setLocalAdminSessionLock,
  type LocalAdminSessionLock
} from "@/lib/election/local-store";
import { getRequestClientIp } from "@/lib/network/request-origin";

export const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_LOCK_KEY = "admin_session_lock";
const ADMIN_SESSION_TTL_MS = 10 * 60 * 1000;
const DEFAULT_ADMIN_PASSWORD = "12345678";

type AdminSessionLock = LocalAdminSessionLock;

function hasDatabaseBinding() {
  return Boolean(getBindings().DB);
}

function getAdminSessionExpiry() {
  return new Date(Date.now() + ADMIN_SESSION_TTL_MS).toISOString();
}

function isExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

async function readAdminSessionLock() {
  if (!hasDatabaseBinding()) {
    return getLocalAdminSessionLock();
  }

  const setting = await queryFirst<{ value: string }>(
    getBindings(),
    "SELECT value FROM settings WHERE key = ?;",
    [ADMIN_SESSION_LOCK_KEY]
  );

  if (!setting?.value) {
    return null;
  }

  try {
    return JSON.parse(setting.value) as AdminSessionLock;
  } catch {
    return null;
  }
}

async function writeAdminSessionLock(lock: AdminSessionLock | null) {
  if (!hasDatabaseBinding()) {
    await setLocalAdminSessionLock(lock);
    return;
  }

  if (!lock) {
    await execute(
      getBindings(),
      "DELETE FROM settings WHERE key = ?;",
      [ADMIN_SESSION_LOCK_KEY]
    );
    return;
  }

  await execute(
    getBindings(),
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);",
    [ADMIN_SESSION_LOCK_KEY, JSON.stringify(lock)]
  );
}

async function getActiveAdminSessionLock() {
  const lock = await readAdminSessionLock();

  if (!lock) {
    return null;
  }

  if (isExpired(lock.expiresAt)) {
    await writeAdminSessionLock(null);
    return null;
  }

  return lock;
}

async function refreshAdminSessionLock(lock: AdminSessionLock) {
  const nextLock: AdminSessionLock = {
    ...lock,
    expiresAt: getAdminSessionExpiry(),
    updatedAt: new Date().toISOString()
  };

  await writeAdminSessionLock(nextLock);
  return nextLock;
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return false;
  }

  const lock = await getActiveAdminSessionLock();
  if (!lock || lock.sessionToken !== sessionToken) {
    return false;
  }

  await refreshAdminSessionLock(lock);
  return true;
}

export async function setAdminSession(requestHeaders?: Headers) {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const sessionToken = existingToken ?? crypto.randomUUID();
  const activeLock = await getActiveAdminSessionLock();

  if (activeLock && activeLock.sessionToken !== sessionToken) {
    throw new Error("The admin dashboard is already open on another device in this network.");
  }

  const now = new Date().toISOString();
  await writeAdminSessionLock({
    sessionToken,
    clientIp: getRequestClientIp(requestHeaders),
    issuedAt: activeLock?.issuedAt ?? now,
    updatedAt: now,
    expiresAt: getAdminSessionExpiry()
  });

  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const activeLock = await getActiveAdminSessionLock();

  if (activeLock && activeLock.sessionToken === sessionToken) {
    await writeAdminSessionLock(null);
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function requireAdminAccess(nextPath = "/admin") {
  if (!(await isAdminAuthenticated())) {
    redirect(`/admin?next=${encodeURIComponent(nextPath)}`);
  }
}

export async function requireAdminApiAccess() {
  if (await isAdminAuthenticated()) {
    return null;
  }

  return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
}

export async function assertAdminPassword(password: string) {
  return password === getAdminPassword();
}

export function normalizeAdminNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/admin";
  }

  return nextPath.startsWith("/results") ? nextPath : "/admin";
}
