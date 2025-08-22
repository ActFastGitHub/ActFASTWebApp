import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { ok: false, status: 401 };
  const p = await prisma.profile.findUnique({
    where: { userEmail: session.user.email },
    select: { role: true },
  });
  const role = (p?.role ?? "").toLowerCase();
  return { ok: ["admin", "owner"].includes(role), status: 403 };
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await isAdmin();
  if (!admin.ok) return NextResponse.json({ status: admin.status, error: "Forbidden" });

  const body = await req.json();
  const {
    model,
    serial,
    status,
    archived,
    type,               // NEW: string (type code)
    assetNumber,        // NEW: number
    currentProjectCode, // NEW: string | null
  } = body ?? {};

  const data: any = {};

  if (typeof model !== "undefined") data.model = model || null;
  if (typeof serial !== "undefined") data.serial = serial || null;
  if (typeof status !== "undefined") data.status = status;
  if (typeof archived === "boolean") data.archived = archived;

  if (typeof currentProjectCode !== "undefined") {
    data.currentProjectCode = currentProjectCode || null;
  }

  // Handle type (typeCode) change
  if (typeof type !== "undefined") {
    const code = String(type).trim();
    if (!code) {
      return NextResponse.json({ status: 400, error: "Type cannot be empty" });
    }
    // ensure EquipmentType exists
    await prisma.equipmentType.upsert({
      where: { code },
      update: {},
      create: { code },
    });
    data.typeCode = code;
  }

  // Handle assetNumber change
  if (typeof assetNumber !== "undefined") {
    const n = Number(assetNumber);
    if (!Number.isInteger(n) || n < 0) {
      return NextResponse.json({ status: 400, error: "assetNumber must be a positive integer" });
    }
    data.assetNumber = n;
  }

  try {
    const item = await prisma.equipment.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ status: 200, item });
  } catch (e: any) {
    // P2002 = unique constraint (composite typeCode+assetNumber)
    if (e?.code === "P2002") {
      return NextResponse.json({
        status: 409,
        error:
          "That Type + Asset # already exists. Please choose a different number (or type).",
      });
    }
    return NextResponse.json({ status: 500, error: "Update failed" });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await isAdmin();
  if (!admin.ok) return NextResponse.json({ status: admin.status, error: "Forbidden" });

  try {
    await prisma.equipment.delete({ where: { id: params.id } });
    return NextResponse.json({ status: 200 });
  } catch {
    return NextResponse.json({ status: 500, error: "Delete failed" });
  }
}
