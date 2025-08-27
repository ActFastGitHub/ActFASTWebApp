// app/api/equipment/upsert/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const type = String(body?.type ?? "").trim();
  const assetNumber = Number(body?.assetNumber);
  const model = typeof body?.model === "string" ? body.model.trim() : null;
  const serial = typeof body?.serial === "string" ? body.serial.trim() : null;

  if (!type || !Number.isInteger(assetNumber) || assetNumber <= 0) {
    return NextResponse.json(
      { status: 400, error: "type and positive integer assetNumber are required" },
      { status: 400 }
    );
  }

  // If equipment already exists, return 409 with the exact message
  const existing = await prisma.equipment.findUnique({
    where: { typeCode_assetNumber: { typeCode: type, assetNumber } },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { status: 409, error: `${type} #${assetNumber} already exists` },
      { status: 409 }
    );
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
    select: { id: true },
  });

  return NextResponse.json({ status: 200, id: created.id, created: true });
}
