import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const type = String(body?.type ?? "").trim();
  const assetNumber = Number(body?.assetNumber);
  const model = typeof body?.model === "string" ? body.model.trim() : null;
  const serial = typeof body?.serial === "string" ? body.serial.trim() : null;

  if (!type || !Number.isInteger(assetNumber) || assetNumber <= 0) {
    return NextResponse.json({ status: 400, error: "type and positive integer assetNumber are required" });
  }

  const existing = await prisma.equipment.findFirst({
    where: { typeCode: type, assetNumber },
  });

  if (existing) {
    const updated = await prisma.equipment.update({
      where: { id: existing.id },
      data: {
        ...(model !== null ? { model } : {}),
        ...(serial !== null ? { serial } : {}),
      },
    });
    return NextResponse.json({ status: 200, id: updated.id, created: false });
  }

  const created = await prisma.equipment.create({
    data: {
      typeCode: type,
      assetNumber,
      model,
      serial,
      status: "WAREHOUSE",
      archived: false,
    },
  });

  return NextResponse.json({ status: 200, id: created.id, created: true });
}
