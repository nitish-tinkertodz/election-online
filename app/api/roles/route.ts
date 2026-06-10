import { NextResponse } from "next/server";

import { requireAdminApiAccess } from "@/lib/auth/admin";
import {
  createRole,
  deleteRole,
  listRoles,
  updateRole
} from "@/lib/roles/role-repository";

export async function GET() {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

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
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

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

export async function PUT(request: Request) {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    const payload = await request.json();
    const { id, ...input } = payload as { id?: string } & Parameters<typeof createRole>[0];

    if (!id) {
      return NextResponse.json(
        { message: "Role id is required for updates." },
        { status: 400 }
      );
    }

    const role = await updateRole(id, input);
    return NextResponse.json({ item: role });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to update role." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const unauthorized = await requireAdminApiAccess();
    if (unauthorized) {
      return unauthorized;
    }

    const payload = (await request.json()) as { id?: string };

    if (!payload.id) {
      return NextResponse.json(
        { message: "Role id is required for deletion." },
        { status: 400 }
      );
    }

    return NextResponse.json({ item: await deleteRole(payload.id) });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to delete role." },
      { status: 400 }
    );
  }
}
