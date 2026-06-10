import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin";
import { isSchoolBrandingConfigured } from "@/lib/branding/branding-service";
import { readLocalBrandingLogo, storeLocalBrandingLogo } from "@/lib/storage/photos";

export async function GET() {
  try {
    const logo = await readLocalBrandingLogo();
    return new NextResponse(logo.fileBuffer, {
      headers: {
        "Content-Type": logo.contentType,
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return NextResponse.json({ message: "Logo not found." }, { status: 404 });
  }
}

export async function POST(request: Request) {
  const isConfigured = await isSchoolBrandingConfigured();
  if (isConfigured) {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }
  }

  const formData = await request.formData();
  const logo = formData.get("logo");

  if (!(logo instanceof File)) {
    return NextResponse.json({ message: "Logo file is required." }, { status: 400 });
  }

  try {
    const result = await storeLocalBrandingLogo(logo);
    return NextResponse.json({
      logo_url: result.logoUrl,
      storage_mode: result.storageMode
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Logo upload failed." },
      { status: 400 }
    );
  }
}
