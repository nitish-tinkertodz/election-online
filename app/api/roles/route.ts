import { NextResponse } from "next/server";

import { createRole, listRoles } from "@/lib/roles/role-repository";

export async function GET() {
  try {
    return NextResponse.json({ items: await listRoles() });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to list roles." },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const role = await createRole(payload);
    return NextResponse.json({ item: role }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to create role." },
      { status: 400 }
    );
  }
}
