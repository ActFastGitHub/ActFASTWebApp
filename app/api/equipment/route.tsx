import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

function daysBetween(a: Date, b: Date) {
  return Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ status: 401, error: "Unauthorized" });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;          // Equipment.typeCode
  const status = searchParams.get("status") || undefined;
  const projectCode = searchParams.get("projectCode") || undefined;
  const minDays = parseInt(searchParams.get("minDays") || "0", 10);
  const includeArchived = searchParams.get("includeArchived") === "1";

  const where: any = {};
  if (!includeArchived) where.archived = false;
  if (type) where.typeCode = type;
  if (status) where.status = status;
  if (projectCode) where.currentProjectCode = projectCode;

  const items = await prisma.equipment.findMany({
    where,
    orderBy: [{ typeCode: "asc" }, { assetNumber: "asc" }],
    select: {
      id: true,
      assetNumber: true,
      typeCode: true,
      status: true,
      archived: true,
      currentProjectCode: true,
      lastMovedAt: true,
      model: true,
      serial: true,
    }
  });

  const withDays = await Promise.all(items.map(async (e) => {
    let daysDeployed: number | undefined = undefined;
    if (e.status === "DEPLOYED") {
      const lastOut = await prisma.equipmentMovement.findFirst({
        where: { equipmentId: e.id, direction: "OUT" },
        orderBy: { at: "desc" },
        select: { at: true },
      });
      if (lastOut) daysDeployed = daysBetween(new Date(), new Date(lastOut.at));
    }
    return { ...e, daysDeployed };
  }));

  const filtered = minDays > 0
    ? withDays.filter((e) => (e.status === "DEPLOYED" ? (e.daysDeployed ?? 0) >= minDays : false))
    : withDays;

  const uiItems = filtered.map(i => ({ ...i, type: i.typeCode }));
  return NextResponse.json({ status: 200, items: uiItems });
}
