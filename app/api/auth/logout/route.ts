import { NextResponse } from "next/server";

import { clearAdminSession } from "@/lib/auth/admin";

export async function POST(request: Request) {
  await clearAdminSession();
  const response = NextResponse.redirect(new URL("/admin", request.url));
  return response;
}
