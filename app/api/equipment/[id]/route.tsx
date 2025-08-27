// app/api/equipment/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import type { UpdateEquipmentPayload, EquipmentStatus } from "@/app/types/equipment";
import { STATUSES } from "@/app/types/equipment";

function isStatus(v: unknown): v is EquipmentStatus {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v);
}
async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { ok: false, status: 401 as const };
  const p = await prisma.profile.findUnique({
    where: { userEmail: session.user.email },
    select: { role: true },
  });
  const role = (p?.role ?? "").toLowerCase();
  return { ok: ["admin", "owner"].includes(role), status: 403 as const };
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await isAdmin();
  if (!auth.ok) return NextResponse.json({ status: auth.status, error: "Forbidden" }, { status: auth.status });

  const body = (await req.json().catch(() => ({}))) as Partial<UpdateEquipmentPayload>;
  const data: Record<string, unknown> = {};

  if (typeof body.model !== "undefined") data.model = body.model ? String(body.model) : null;
  if (typeof body.serial !== "undefined") data.serial = body.serial ? String(body.serial) : null;
  if (typeof body.archived === "boolean") data.archived = body.archived;
  if (typeof body.currentProjectCode !== "undefined")
    data.currentProjectCode = body.currentProjectCode ? String(body.currentProjectCode) : null;

  let incomingTypeCode: string | undefined;
  let incomingAssetNumber: number | undefined;

  if (typeof body.type !== "undefined") {
    const t = String(body.type).trim();
    if (!t) return NextResponse.json({ status: 400, error: "Type cannot be empty" }, { status: 400 });
    incomingTypeCode = t;
    data.typeCode = t;
  }
  if (typeof body.assetNumber !== "undefined") {
    const n = Number(body.assetNumber);
    if (!Number.isInteger(n) || n <= 0)
      return NextResponse.json({ status: 400, error: "assetNumber must be a positive integer" }, { status: 400 });
    incomingAssetNumber = n;
    data.assetNumber = n;
  }
  if (typeof body.status !== "undefined") {
    if (!isStatus(body.status)) return NextResponse.json({ status: 400, error: "Invalid status" }, { status: 400 });
    data.status = body.status;
  }

  try {
    // Load current values so we can determine the final (typeCode, assetNumber) pair
    const current = await prisma.equipment.findUnique({
      where: { id: params.id },
      select: { typeCode: true, assetNumber: true },
    });
    if (!current) {
      return NextResponse.json({ status: 404, error: "Equipment not found" }, { status: 404 });
    }

    const nextType = (incomingTypeCode ?? current.typeCode).trim();
    const nextNum = incomingAssetNumber ?? current.assetNumber;

    // If the unique pair is changing, pre-check for conflicts and return friendly 409
    const pairChanged = nextType !== current.typeCode || nextNum !== current.assetNumber;
    if (pairChanged) {
      const conflict = await prisma.equipment.findUnique({
        where: { typeCode_assetNumber: { typeCode: nextType, assetNumber: nextNum } },
        select: { id: true },
      });
      if (conflict) {
        return NextResponse.json(
          { status: 409, error: `${nextType} #${nextNum} already exists` },
          { status: 409 }
        );
      }
    }

    const item = await prisma.equipment.update({ where: { id: params.id }, data });
    return NextResponse.json({ status: 200, item });
  } catch (e: any) {
    // Fallback: unique constraint from Prisma just in case
    if (e?.code === "P2002") {
      return NextResponse.json(
        {
          status: 409,
          error: "That Type + Asset # already exists. Pick a different number or type.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ status: 500, error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await isAdmin();
  if (!auth.ok) return NextResponse.json({ status: auth.status, error: "Forbidden" }, { status: auth.status });

  try {
    await prisma.equipment.delete({ where: { id: params.id } });
    return NextResponse.json({ status: 200 });
  } catch {
    return NextResponse.json({ status: 500, error: "Delete failed" }, { status: 500 });
  }
}
