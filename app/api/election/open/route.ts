import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin";
import { openElection } from "@/lib/election/election-service";

export async function POST() {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    return NextResponse.json(await openElection());
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to open election." },
      { status: 400 }
    );
  }
}
