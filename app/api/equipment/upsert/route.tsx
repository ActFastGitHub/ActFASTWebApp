import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ status: 401, error: "Unauthorized" });

  const { assetNumber, type, model, serial } = await req.json();
  if (typeof assetNumber !== "number" || !type?.trim())
    return NextResponse.json({ status: 400, error: "assetNumber:number and type:string required" });

  await prisma.equipmentType.upsert({ where: { code: type.trim() }, update: {}, create: { code: type.trim() } });

  const eq = await prisma.equipment.upsert({
    where: { typeCode_assetNumber: { typeCode: type.trim(), assetNumber } },
    update: { model: model ?? undefined, serial: serial ?? undefined, archived: false },
    create: { typeCode: type.trim(), assetNumber, model: model ?? undefined, serial: serial ?? undefined, status: "WAREHOUSE" },
  });

  return NextResponse.json({ status: 200, item: eq });
}
