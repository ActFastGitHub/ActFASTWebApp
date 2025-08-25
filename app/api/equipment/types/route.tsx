import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET() {
  const rows = await prisma.equipment.findMany({ select: { typeCode: true } });
  const items = Array.from(new Set(rows.map(r => r.typeCode))).sort().map(code => ({ code }));
  return NextResponse.json({ status: 200, items });
}
