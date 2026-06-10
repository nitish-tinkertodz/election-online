import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin";
import { getElection } from "@/lib/election/election-service";

export async function GET() {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    return NextResponse.json({ item: await getElection() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load election." },
      { status: 503 }
    );
  }
}

