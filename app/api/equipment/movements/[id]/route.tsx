import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import type { DeleteResponse } from "@/app/types/equipment";

async function canDelete() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { ok: false, status: 401 as const };
  const p = await prisma.profile.findUnique({
    where: { userEmail: session.user.email },
    select: { role: true },
  });
  const role = (p?.role || "").toLowerCase();
  return { ok: ["admin", "owner"].includes(role), status: 403 as const };
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await canDelete();
  if (!auth.ok) return NextResponse.json<DeleteResponse>({ status: auth.status, error: "Forbidden" });
  if (!params?.id) return NextResponse.json<DeleteResponse>({ status: 400, error: "Missing id" });

  try {
    await prisma.equipmentMovement.delete({ where: { id: params.id } });
    return NextResponse.json<DeleteResponse>({ status: 200 });
  } catch {
    return NextResponse.json<DeleteResponse>({ status: 500, error: "Delete failed" });
  }
}
