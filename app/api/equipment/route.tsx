// app/api/equipment/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import type { EquipmentDTO } from "@/app/types/equipment";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "").trim();
    const status = (searchParams.get("status") || "").trim();
    const includeArchived = searchParams.get("includeArchived") === "1";

    const where: any = {};
    if (type) where.typeCode = type;           // ⬅️ schema field
    if (status) where.status = status;
    if (!includeArchived) where.archived = { not: true };

    const equipments = await prisma.equipment.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        typeCode: true,                         // ⬅️ select schema field
        assetNumber: true,
        status: true,
        archived: true,
        currentProjectCode: true,
        model: true,
        serial: true,
        lastMovedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (equipments.length === 0) {
      return NextResponse.json({ status: 200, items: [] });
    }

    const ids = equipments.map((e) => e.id);

    // newest-first movements for these equipments
    const movements = await prisma.equipmentMovement.findMany({
      where: { equipmentId: { in: ids } },
      orderBy: { at: "desc" },
      select: {
        equipmentId: true,
        at: true,
        direction: true, // "IN" | "OUT"
        byId: true,
        by: { select: { firstName: true, lastName: true, nickname: true } },
      },
    });

    // first per equipmentId = latest (due to desc)
    const latestByEquip = new Map<
      string,
      { at: Date; direction: "IN" | "OUT"; byLabel: string | null }
    >();

    for (const m of movements) {
      if (!latestByEquip.has(m.equipmentId)) {
        const label =
          (m.by?.firstName || m.by?.lastName)
            ? `${m.by?.firstName ?? ""} ${m.by?.lastName ?? ""}`.trim()
            : (m.by?.nickname || m.byId || null);

        latestByEquip.set(m.equipmentId, {
          at: m.at,
          direction: (m.direction as "IN" | "OUT") ?? "OUT",
          byLabel: label || null,
        });
      }
    }

    const items: EquipmentDTO[] = equipments.map((e) => {
      const latest = latestByEquip.get(e.id);
      return {
        id: e.id,
        type: e.typeCode,                        // ⬅️ map to DTO
        assetNumber: e.assetNumber,
        status: e.status as any,
        archived: !!e.archived,

        currentProjectCode: e.currentProjectCode ?? null,
        model: e.model ?? null,
        serial: e.serial ?? null,

        lastMovedAt: e.lastMovedAt ?? latest?.at ?? null,
        lastMovedBy: latest?.byLabel ?? null,
        lastMovementDirection: latest?.direction ?? null,

        createdAt: e.createdAt ?? null,
        updatedAt: e.updatedAt ?? null,
      };
    });

    return NextResponse.json({ status: 200, items });
  } catch (err) {
    console.error("[/api/equipment GET] error", err);
    return NextResponse.json(
      { status: 500, error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}
