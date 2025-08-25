import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import type { MoveRequest, MoveResponse, EquipmentMoveItem, MovementDirection } from "@/app/types/equipment";

function isDirection(v: unknown): v is MovementDirection { return v === "IN" || v === "OUT"; }
function isItem(x: unknown): x is EquipmentMoveItem {
  if (!x || typeof x !== "object") return false;
  const it = x as Record<string, unknown>;
  const t = typeof it.type === "string" ? it.type.trim() : "";
  const n = typeof it.assetNumber === "number" ? it.assetNumber : NaN;
  return !!t && Number.isInteger(n) && n > 0;
}
function normalizeItems(arr: unknown): EquipmentMoveItem[] {
  if (!Array.isArray(arr)) return [];
  const items = arr
    .map((r) => {
      if (!r || typeof r !== "object") return null;
      const o = r as Record<string, unknown>;
      return { type: String(o.type ?? "").trim(), assetNumber: Number(o.assetNumber) } as EquipmentMoveItem;
    })
    .filter(isItem);

  const seen = new Set<string>();
  const uniq: EquipmentMoveItem[] = [];
  for (const i of items) {
    const k = `${i.type}#${i.assetNumber}`;
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(i);
  }
  return uniq;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json<MoveResponse>({ status: 401, error: "Unauthorized" });

  const raw = (await req.json().catch(() => null)) as Partial<MoveRequest> | null;
  if (!raw || typeof raw !== "object") return NextResponse.json<MoveResponse>({ status: 400, error: "Invalid body" });

  const direction = typeof raw.direction === "string" ? raw.direction.toUpperCase() : "";
  if (!isDirection(direction)) return NextResponse.json<MoveResponse>({ status: 400, error: "Invalid direction" });

  const when = raw.when ? new Date(raw.when) : new Date();
  if (Number.isNaN(when.getTime())) return NextResponse.json<MoveResponse>({ status: 400, error: "Invalid date/time" });

  const items = normalizeItems(raw.items);
  if (!items.length) return NextResponse.json<MoveResponse>({ status: 400, error: "No items provided" });

  const projectCode = typeof raw.projectCode === "string" ? raw.projectCode.trim() : "";
  if (direction === "OUT" && !projectCode)
    return NextResponse.json<MoveResponse>({ status: 400, error: "Project code is required for OUT moves" });

  // Check existence (THIS DOES NOT CREATE)
  const found = await prisma.equipment.findMany({
    where: { OR: items.map(i => ({ typeCode: i.type, assetNumber: i.assetNumber })) },
    select: { id: true, typeCode: true, assetNumber: true },
  });
  const foundSet = new Set(found.map(f => `${f.typeCode}#${f.assetNumber}`));
  const missing = items.filter(i => !foundSet.has(`${i.type}#${i.assetNumber}`));
  if (missing.length) {
    return NextResponse.json<MoveResponse>({
      status: 400,
      error: "Some items do not exist. Please create them first in Equipment Management.",
      missing: missing.map(m => `${m.type} #${m.assetNumber}`),
    });
  }

  const prof = await prisma.profile.findUnique({
    where: { userEmail: session.user.email! },
    select: { nickname: true },
  });
  const byId = prof?.nickname ?? null;

  // Atomically write movements + update equipment
  await prisma.$transaction(found.flatMap(f => ([
    prisma.equipmentMovement.create({
      data: {
        equipmentId: f.id,
        direction,
        at: when,
        projectCode: direction === "OUT" ? projectCode : null,
        byId,
        source: "WEB",
        note: typeof raw.note === "string" ? raw.note : null,
        rawMessage: typeof raw.rawMessage === "string" ? raw.rawMessage : null,
      },
    }),
    prisma.equipment.update({
      where: { id: f.id },
      data: {
        status: direction === "IN" ? "WAREHOUSE" : "DEPLOYED",
        currentProjectCode: direction === "IN" ? null : projectCode,
        lastMovedAt: when,
        updatedAt: new Date(),
      },
    }),
  ])));

  return NextResponse.json<MoveResponse>({ status: 200, moved: found.length });
}
