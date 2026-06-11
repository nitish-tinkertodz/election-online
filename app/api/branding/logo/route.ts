import { NextResponse } from "next/server";

import { readSchoolLogo } from "@/lib/storage/branding";

export async function GET() {
  try {
    const logo = await readSchoolLogo();
    return new NextResponse(logo.fileBuffer, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": logo.contentType
      }
    });
  } catch {
    return NextResponse.json({ message: "School logo not found." }, { status: 404 });
  }
}
