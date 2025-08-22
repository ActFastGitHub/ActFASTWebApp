import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

function parseWhatsApp(raw: string): { type: string; assetNumbers: number[] }[] {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const map: Record<string,string> = {
    dehu: "Dehumidifier", dehumidifier: "Dehumidifier", dehumidifiers: "Dehumidifier",
    blower: "Blower", blowers: "Blower",
    "air scrubber": "Air Scrubber", "air scrubbers": "Air Scrubber", scrubber: "Air Scrubber", scrubbers: "Air Scrubber",
    vehicle: "Vehicle", vehicles: "Vehicle",
  };
  const out: Record<string, Set<number>> = {};
  for (const line of lines) {
    const m = line.toLowerCase().match(/^(.*?)(?:\s*#:\s*)(.+)$/);
    if (!m) continue;
    const rawType = m[1].replace(/[:#]/g, "").trim();
    const normKey = Object.keys(map).find(k => rawType.includes(k));
    if (!normKey) continue;
    const nums = m[2].split(/[,;\s]+/).map(x => parseInt(x, 10)).filter(n => !isNaN(n));
    const typeCode = map[normKey];
    out[typeCode] ||= new Set<number>();
    nums.forEach((n) => out[typeCode].add(n));
  }
  return Object.entries(out).map(([type,set]) => ({ type, assetNumbers: Array.from(set) }));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ status: 401, error: "Unauthorized" });

  const profile = await prisma.profile.findUnique({ where: { userEmail: session.user.email }, select: { nickname: true }});
  const byId = profile?.nickname ?? undefined;

  const { raw, direction, projectCode, at } = await req.json() as {
    raw: string; direction: "OUT" | "IN"; projectCode?: string; at?: string;
  };
  if (direction === "OUT" && !projectCode) return NextResponse.json({ status: 400, error: "projectCode required for OUT" });

  const moveAt = at ? new Date(at) : new Date();
  if (isNaN(moveAt.getTime())) return NextResponse.json({ status: 400, error: "Invalid 'at' date-time" });

  const parsed = parseWhatsApp(raw);
  const results: any[] = [];

  for (const group of parsed) {
    await prisma.equipmentType.upsert({ where: { code: group.type }, update: {}, create: { code: group.type } });

    for (const num of group.assetNumbers) {
      try {
        await prisma.$transaction(async (tx) => {
          const eq = await tx.equipment.upsert({
            where: { typeCode_assetNumber: { typeCode: group.type, assetNumber: num } },
            update: {},
            create: { typeCode: group.type, assetNumber: num, status: "WAREHOUSE" },
          });
          await tx.equipmentMovement.create({
            data: {
              equipmentId: eq.id,
              direction,
              at: moveAt,
              projectCode: direction === "OUT" ? projectCode : eq.currentProjectCode ?? undefined,
              byId, source: "WHATSAPP", rawMessage: raw,
            },
          });
          await tx.equipment.update({
            where: { id: eq.id },
            data: {
              status: direction === "IN" ? "WAREHOUSE" : "DEPLOYED",
              currentProjectCode: direction === "OUT" ? projectCode! : null,
              lastMovedAt: moveAt,
            },
          });
        });
        results.push({ assetNumber: num, ok: true, type: group.type });
      } catch (e: any) {
        results.push({ assetNumber: num, ok: false, type: group.type, msg: e?.message ?? "error" });
      }
    }
  }

  return NextResponse.json({ status: 200, results });
}
