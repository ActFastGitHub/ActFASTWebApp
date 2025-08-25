import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(200, Number(searchParams.get("limit") ?? 50)));

  const rows = await prisma.equipmentMovement.findMany({
    orderBy: { at: "desc" },
    take: limit,
    select: {
      id: true, direction: true, at: true, projectCode: true, note: true, byId: true,
      equipment: { select: { typeCode: true, assetNumber: true } },
    },
  });

  const items = rows.map(r => ({
    id: r.id,
    direction: r.direction,
    at: r.at,
    projectCode: r.projectCode,
    note: r.note,
    byId: r.byId,
    type: r.equipment.typeCode,
    assetNumber: r.equipment.assetNumber,
  }));

  return NextResponse.json({ status: 200, items });
}
