import { NextResponse } from "next/server";

import { execute, queryAll } from "@/lib/db";
import { getBindings } from "@/lib/db/platform";
import { brandingSchema } from "@/lib/validation";

export async function GET() {
  try {
    const rows = await queryAll<{ key: string; value: string }>(
      getBindings(),
      "SELECT key, value FROM settings WHERE key IN (?, ?);",
      ["school_name", "school_logo_url"]
    );

    const schoolName = rows.find((row) => row.key === "school_name")?.value ?? "School Election Voting System";
    const schoolLogo = rows.find((row) => row.key === "school_logo_url")?.value ?? "";

    return NextResponse.json({
      school_name: schoolName,
      school_logo_url: schoolLogo
    });
  } catch {
    return NextResponse.json({
      school_name: "School Election Voting System",
      school_logo_url: ""
    });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = brandingSchema.parse(await request.json());
    await execute(
      getBindings(),
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);",
      ["school_name", payload.school_name]
    );
    await execute(
      getBindings(),
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);",
      ["school_logo_url", payload.school_logo_url || ""]
    );

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to update branding." },
      { status: 400 }
    );
  }
}
