import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Keep the safety cap at 200 per request, but allow paging via skip.
  const limitRaw = Number(searchParams.get("limit") ?? 50);
  const limit = Math.max(1, Math.min(200, Number.isFinite(limitRaw) ? limitRaw : 50));

  const skipRaw = Number(searchParams.get("skip") ?? 0);
  const skip = Math.max(0, Number.isFinite(skipRaw) ? skipRaw : 0);

  // total count (so UI can verify expected ~790, etc.)
  const total = await prisma.equipmentMovement.count();

  const rows = await prisma.equipmentMovement.findMany({
    orderBy: { at: "desc" },
    take: limit,
    skip,
    select: {
      id: true,
      direction: true,
      at: true,
      projectCode: true,
      note: true,
      byId: true,
      equipment: { select: { typeCode: true, assetNumber: true } },
    },
  });

  const items = rows.map((r) => ({
    id: r.id,
    direction: r.direction,
    at: r.at,
    projectCode: r.projectCode,
    note: r.note,
    byId: r.byId,
    // keep compatibility with your UI (you already handle legacy shape)
    type: r.equipment?.typeCode ?? "",
    assetNumber: r.equipment?.assetNumber ?? 0,
    equipment: r.equipment
      ? { type: r.equipment.typeCode, assetNumber: r.equipment.assetNumber }
      : undefined,
  }));

  return NextResponse.json({ status: 200, items, total, limit, skip });
}
