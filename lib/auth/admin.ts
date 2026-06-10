import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const ADMIN_COOKIE = "admin_session";
const DEFAULT_ADMIN_PASSWORD = "12345678";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "authenticated";
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
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
