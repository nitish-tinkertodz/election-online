import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin";
import { listDivisions } from "@/lib/divisions/division-repository";

export async function GET() {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    return NextResponse.json({ items: await listDivisions() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to list divisions." },
      { status: 503 }
    );
  }
}

