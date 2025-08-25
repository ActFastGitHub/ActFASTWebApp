import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import type { EquipmentDTO, EquipmentStatus } from "@/app/types/equipment";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;   // UI sends 'type'
  const status = (searchParams.get("status") || undefined) as EquipmentStatus | undefined;
  const includeArchived = searchParams.get("includeArchived") === "1";

  const rows = await prisma.equipment.findMany({
    where: {
      ...(type ? { typeCode: type } : {}),
      ...(status ? { status } : {}),
      ...(includeArchived ? {} : { archived: false }),
    },
    orderBy: [{ typeCode: "asc" }, { assetNumber: "asc" }],
    select: {
      id: true, createdAt: true, updatedAt: true,
      assetNumber: true, typeCode: true, model: true, serial: true,
      status: true, archived: true, currentProjectCode: true, lastMovedAt: true,
    },
  });

  const items: EquipmentDTO[] = rows.map(r => ({
    id: r.id,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    assetNumber: r.assetNumber,
    type: r.typeCode,  // map for UI
    model: r.model,
    serial: r.serial,
    status: r.status as EquipmentStatus,
    archived: r.archived,
    currentProjectCode: r.currentProjectCode,
    lastMovedAt: r.lastMovedAt,
  }));

  return NextResponse.json({ status: 200, items });
}
