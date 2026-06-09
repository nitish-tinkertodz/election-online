import { NextResponse } from "next/server";

import { assertAdminPassword, setAdminSession } from "@/lib/auth/admin";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/admin");

  if (!(await assertAdminPassword(password))) {
    return NextResponse.redirect(new URL("/admin?error=invalid-password", request.url));
  }

  await setAdminSession();
  return NextResponse.redirect(new URL(nextPath, request.url));
}
