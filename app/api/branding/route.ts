import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin";
import { getLocalBranding, setLocalBranding } from "@/lib/election/local-store";
import { storeSchoolLogo } from "@/lib/storage/branding";
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

export async function POST(request: Request) {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    const currentBranding = await getLocalBranding();
    const formData = await request.formData();
    const schoolName = String(formData.get("school_name") ?? "");
    const logo = formData.get("logo");
    const schoolLogoUrl =
      logo instanceof File && logo.size > 0
        ? await storeSchoolLogo(logo)
        : currentBranding.school_logo_url;
    const payload = brandingSchema.parse({
      school_name: schoolName,
      school_logo_url: schoolLogoUrl
    });

    await setLocalBranding(payload);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to update branding." },
      { status: 400 }
    );
  }
}
