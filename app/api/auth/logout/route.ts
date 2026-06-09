import { NextResponse } from "next/server";

import { clearAdminSession } from "@/lib/auth/admin";

export async function POST(request: Request) {
  await clearAdminSession();
  return NextResponse.redirect(new URL("/admin", request.url));
}
