import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

export async function GET() {
  const types = await prisma.equipmentType.findMany({
    orderBy: { code: "asc" },
    select: { code: true, description: true },
  });
  return NextResponse.json({ status: 200, items: types });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ status: 401, error: "Unauthorized" });

  const { code, description } = await req.json();
  const trimmed = (code ?? "").trim();
  if (!trimmed) return NextResponse.json({ status: 400, error: "Type code required" });

  const item = await prisma.equipmentType.upsert({
    where: { code: trimmed },
    update: { description: description ?? undefined },
    create: { code: trimmed, description: description ?? undefined },
  });

  return NextResponse.json({ status: 200, item });
}
