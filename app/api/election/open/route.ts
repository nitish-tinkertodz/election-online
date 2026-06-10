import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin";
import { openElection } from "@/lib/election/election-service";

export async function POST(request: Request) {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    const scope = (await request.json().catch(() => null)) as
      | {
          scope_type?: "SCHOOL" | "CLASS";
          class_id?: string | null;
          division_id?: string | null;
        }
      | null;

    return NextResponse.json(await openElection(scope ?? undefined));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to open election." },
      { status: 400 }
    );
  }
}
