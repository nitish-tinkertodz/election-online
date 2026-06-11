import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin";
import { getLocalBranding, setLocalBranding } from "@/lib/election/local-store";
import { brandingSchema } from "@/lib/validation";

export async function GET() {
  return NextResponse.json(await getLocalBranding());
}

export async function PUT(request: Request) {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    const payload = brandingSchema.parse(await request.json());
    await setLocalBranding({
      school_name: payload.school_name,
      school_logo_url: payload.school_logo_url || ""
    });

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to update branding." },
      { status: 400 }
    );
  }
}
