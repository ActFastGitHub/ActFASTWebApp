// app/api/equipment/move/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import type {
  MoveRequest,
  MoveResponse,
  MovementDirection,
} from "@/app/types/equipment";

/* ===========================
 *  Helpers
 * =========================== */

function parseIntOr<T extends number>(v: string | null, def: T): number {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : def;
}

function uniqBy<T, K extends string | number>(arr: T[], key: (x: T) => K): T[] {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const x of arr) {
    const k = key(x);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
  }
  return out;
}

function labelForMover(
  p?: { firstName: string | null; lastName: string | null; nickname: string | null } | null,
  fallback?: string | null
) {
  const name = `${p?.firstName ?? ""} ${p?.lastName ?? ""}`.trim();
  return name || p?.nickname || fallback || null;
}

/* ===========================
 *  GET: recent movements (paged)
 * =========================== */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseIntOr(searchParams.get("days"), 30);
    const includeOlder = searchParams.get("includeOlder") === "1";
    const page = Math.max(1, parseIntOr(searchParams.get("page"), 1));
    const pageSize = Math.min(100, Math.max(1, parseIntOr(searchParams.get("pageSize"), 20)));

    const type = (searchParams.get("type") || "").trim();
    const projectCode = (searchParams.get("projectCode") || "").trim();
    const direction = (searchParams.get("direction") || "").trim() as MovementDirection | "";

    const since = new Date();
    since.setDate(since.getDate() - days);

    const whereMovement: any = {};
    if (!includeOlder) whereMovement.at = { gte: since };
    if (direction === "IN" || direction === "OUT") whereMovement.direction = direction;
    if (projectCode) whereMovement.projectCode = projectCode;

    const whereEquip: any = {};
    if (type) whereEquip.typeCode = type; // ⬅️ schema field

    const [total, rows] = await prisma.$transaction([
      prisma.equipmentMovement.count({
        where: {
          ...whereMovement,
          equipment: whereEquip,
        },
      }),
      prisma.equipmentMovement.findMany({
        where: {
          ...whereMovement,
          equipment: whereEquip,
        },
        orderBy: { at: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          at: true,
          direction: true,
          projectCode: true,
          byId: true,
          by: { select: { firstName: true, lastName: true, nickname: true } },
          equipment: { select: { id: true, typeCode: true, assetNumber: true } }, // ⬅️ select typeCode
        },
      }),
    ]);

    const items = rows.map((m) => ({
      id: m.id,
      at: m.at,
      direction: m.direction as MovementDirection,
      projectCode: m.projectCode ?? null,
      by: labelForMover(m.by, m.byId ?? null),
      equipment: {
        id: m.equipment.id,
        type: m.equipment.typeCode, // ⬅️ map to DTO field
        assetNumber: m.equipment.assetNumber,
      },
      archived: m.at < since,
    }));

    return NextResponse.json({
      status: 200,
      page,
      pageSize,
      total,
      items,
    });
  } catch (err) {
    console.error("[/api/equipment/move GET] error", err);
    return NextResponse.json(
      { status: 500, error: "Failed to fetch movements" },
      { status: 500 }
    );
  }
}

/* ===========================
 *  POST: record movements
 * =========================== */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json<MoveResponse>(
        { status: 401 as const, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as MoveRequest;
    const direction = body.direction;
    const projectCode = (body.projectCode || "").trim();
    const note = (body.note || "").trim() || null;
    const rawMessage = (body.rawMessage || "").trim() || null;
    const when = body.when ? new Date(body.when) : new Date();

    if (direction !== "IN" && direction !== "OUT") {
      return NextResponse.json<MoveResponse>(
        { status: 400 as const, error: "Invalid direction" },
        { status: 400 }
      );
    }
    if (direction === "OUT" && !projectCode) {
      return NextResponse.json<MoveResponse>(
        { status: 400 as const, error: "Project code is required for OUT" },
        { status: 400 }
      );
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json<MoveResponse>(
        { status: 400 as const, error: "No items provided" },
        { status: 400 }
      );
    }

    // Normalize & dedupe
    const items = uniqBy(
      body.items.map((it) => ({
        type: (it.type || "").trim(),
        assetNumber: Number(it.assetNumber),
      })),
      (x) => `${x.type}#${x.assetNumber}`
    ).filter((x) => x.type && Number.isInteger(x.assetNumber) && x.assetNumber > 0);

    if (items.length === 0) {
      return NextResponse.json<MoveResponse>(
        { status: 400 as const, error: "No valid items after parsing" },
        { status: 400 }
      );
    }

    // current user (who)
    const prof = await prisma.profile.findUnique({
      where: { userEmail: session.user.email! },
      select: { nickname: true },
    });
    const byId = prof?.nickname ?? null;

    // Validate existence (NO implicit creation)
    const orClauses = items.map((x) => ({ typeCode: x.type, assetNumber: x.assetNumber })); // ⬅️ schema fields
    const existing = await prisma.equipment.findMany({
      where: { OR: orClauses },
      select: { id: true, typeCode: true, assetNumber: true }, // ⬅️ select schema fields
    });

    const key = (t: string, n: number) => `${t}#${n}`;
    const existingSet = new Set(existing.map((e) => key(e.typeCode, e.assetNumber)));

    const missing = items
      .filter((x) => !existingSet.has(key(x.type, x.assetNumber)))
      .map((x) => `${x.type} #${x.assetNumber}`);

    if (missing.length > 0) {
      return NextResponse.json<MoveResponse>(
        {
          status: 400 as const,
          error: "Some items do not exist. Ask an admin to create them first.",
          missing,
        },
        { status: 400 }
      );
    }

    const existingMap = new Map(existing.map((e) => [key(e.typeCode, e.assetNumber), e.id]));

    // Transaction: create movements + update equipments
    const results = await prisma.$transaction(async (tx) => {
      await tx.equipmentMovement.createMany({
        data: items.map((x) => ({
          equipmentId: existingMap.get(key(x.type, x.assetNumber))!,
          direction,
          at: when,
          projectCode: direction === "OUT" ? projectCode : null,
          byId,
          source: "UI",
          note,
          rawMessage,
        })),
      });

      for (const x of items) {
        const id = existingMap.get(key(x.type, x.assetNumber))!;
        if (direction === "OUT") {
          await tx.equipment.update({
            where: { id },
            data: {
              status: "DEPLOYED",
              currentProjectCode: projectCode,
              lastMovedAt: when,
              updatedAt: new Date(),
            },
          });
        } else {
          await tx.equipment.update({
            where: { id },
            data: {
              status: "WAREHOUSE",
              currentProjectCode: null,
              lastMovedAt: when,
              updatedAt: new Date(),
            },
          });
        }
      }

      return { moved: items.length };
    });

    return NextResponse.json<MoveResponse>({ status: 200 as const, moved: results.moved });
  } catch (err) {
    console.error("[/api/equipment/move POST] error", err);
    return NextResponse.json<MoveResponse>(
      { status: 500 as const, error: "Failed to record movements" },
      { status: 500 }
    );
  }
}
