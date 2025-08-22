import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

type Direction = "OUT" | "IN";

function expandAssets(input: string): number[] {
  const parts = `${input}`.split(/[,\s]+/).filter(Boolean);
  const out: number[] = [];
  for (const part of parts) {
    const m = part.match(/^(\d+)-(\d+)$/);
    if (m) {
      const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
      const [start, end] = a <= b ? [a, b] : [b, a];
      for (let n = start; n <= end; n++) out.push(n);
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n)) out.push(n);
    }
  }
  return Array.from(new Set(out));
}

async function getNickname(email: string) {
  const p = await prisma.profile.findUnique({ where: { userEmail: email }, select: { nickname: true } });
  return p?.nickname ?? undefined;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ status: 401, error: "Unauthorized" });

  const body = await req.json();
  const { direction, projectCode, assetNumbers, type, note, source, at } = body as {
    direction: Direction;
    projectCode?: string;
    assetNumbers: number[] | string;
    type: string;
    note?: string;
    source?: "MANUAL" | "QR";
    at?: string;
  };

  if (direction !== "IN" && direction !== "OUT")
    return NextResponse.json({ status: 400, error: "direction must be IN or OUT" });

  const list = Array.isArray(assetNumbers) ? assetNumbers : expandAssets(assetNumbers);
  if (list.length === 0) return NextResponse.json({ status: 400, error: "No asset numbers" });
  if (!type?.trim()) return NextResponse.json({ status: 400, error: "type is required (numbers are per-type)" });
  if (direction === "OUT" && !projectCode) return NextResponse.json({ status: 400, error: "projectCode required for OUT" });

  const moveAt = at ? new Date(at) : new Date();
  if (isNaN(moveAt.getTime())) return NextResponse.json({ status: 400, error: "Invalid 'at' date-time" });

  await prisma.equipmentType.upsert({ where: { code: type.trim() }, update: {}, create: { code: type.trim() } });

  const byId = await getNickname(session.user.email!);
  const results: Array<{ assetNumber: number; ok: boolean; msg?: string }> = [];

  for (const n of list) {
    try {
      await prisma.$transaction(async (tx) => {
        let eq = await tx.equipment.findUnique({ where: { typeCode_assetNumber: { typeCode: type.trim(), assetNumber: n } } });
        if (!eq) {
          eq = await tx.equipment.create({ data: { typeCode: type.trim(), assetNumber: n, status: "WAREHOUSE" } });
        }
        if (eq.archived) throw new Error("Archived item");

        if (direction === "OUT") {
          if (eq.status === "DEPLOYED") throw new Error(`${type} #${n} already DEPLOYED`);
          await tx.equipmentMovement.create({
            data: { equipmentId: eq.id, direction: "OUT", at: moveAt, projectCode: projectCode!, byId, source: source ?? "MANUAL", note },
          });
          await tx.equipment.update({
            where: { id: eq.id },
            data: { status: "DEPLOYED", currentProjectCode: projectCode!, lastMovedAt: moveAt },
          });
        } else {
          await tx.equipmentMovement.create({
            data: { equipmentId: eq.id, direction: "IN", at: moveAt, projectCode: eq.currentProjectCode ?? undefined, byId, source: source ?? "MANUAL", note },
          });
          await tx.equipment.update({
            where: { id: eq.id },
            data: { status: "WAREHOUSE", currentProjectCode: null, lastMovedAt: moveAt },
          });
        }
      });
      results.push({ assetNumber: n, ok: true });
    } catch (e: any) {
      results.push({ assetNumber: n, ok: false, msg: e?.message ?? "error" });
    }
  }

  return NextResponse.json({ status: 200, results });
}
