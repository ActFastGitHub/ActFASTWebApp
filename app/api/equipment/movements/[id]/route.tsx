// app/api/equipment/movements/[id]/route.tsx

// import { NextResponse } from "next/server";
// import prisma from "@/app/libs/prismadb";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/libs/authOption";
// import type { DeleteResponse } from "@/app/types/equipment";

// async function canDelete() {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.email) return { ok: false, status: 401 as const };
//   const p = await prisma.profile.findUnique({
//     where: { userEmail: session.user.email },
//     select: { role: true },
//   });
//   const role = (p?.role || "").toLowerCase();
//   return { ok: ["admin", "owner"].includes(role), status: 403 as const };
// }

// export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
//   const auth = await canDelete();
//   if (!auth.ok) return NextResponse.json<DeleteResponse>({ status: auth.status, error: "Forbidden" });
//   if (!params?.id) return NextResponse.json<DeleteResponse>({ status: 400, error: "Missing id" });

//   try {
//     await prisma.equipmentMovement.delete({ where: { id: params.id } });
//     return NextResponse.json<DeleteResponse>({ status: 200 });
//   } catch {
//     return NextResponse.json<DeleteResponse>({ status: 500, error: "Delete failed" });
//   }
// }

// app/api/equipment/movements/[id]/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import type { DeleteResponse } from "@/app/types/equipment";

/* ──────────────────────────────────────────────────────────── */
/*  Auth helpers                                                */
/* ──────────────────────────────────────────────────────────── */

async function getRole() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { role: null as string | null, status: 401 as 401 | 403 };
  const p = await prisma.profile.findUnique({
    where: { userEmail: session.user.email },
    select: { role: true },
  });
  const role = (p?.role || "").toLowerCase();
  const ok = ["admin", "owner"].includes(role);
  return { role, status: ok ? 200 : 403 as 401 | 403 };
}

async function requireAdmin() {
  const { status } = await getRole();
  return { ok: status === 200, status: (status === 200 ? 200 : (status as 401 | 403)) };
}

/* ──────────────────────────────────────────────────────────── */
/*  DELETE (yours, unchanged)                                   */
/* ──────────────────────────────────────────────────────────── */

async function canDelete() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { ok: false, status: 401 as 401 | 403 };
  const p = await prisma.profile.findUnique({
    where: { userEmail: session.user.email },
    select: { role: true },
  });
  const role = (p?.role || "").toLowerCase();
  return { ok: ["admin", "owner"].includes(role), status: 403 as 401 | 403 };
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await canDelete();
  if (!auth.ok) return NextResponse.json<DeleteResponse>({ status: auth.status, error: "Forbidden" });
  if (!params?.id) return NextResponse.json<DeleteResponse>({ status: 400, error: "Missing id" });

  try {
    await prisma.equipmentMovement.delete({ where: { id: params.id } });
    return NextResponse.json<DeleteResponse>({ status: 200 });
  } catch {
    return NextResponse.json<DeleteResponse>({ status: 500, error: "Delete failed" });
  }
}

/* ──────────────────────────────────────────────────────────── */
/*  PATCH (fixed to your schema)                                */
/* ──────────────────────────────────────────────────────────── */

type PatchBody = {
  data?: {
    at?: string; // ISO
    note?: string | null;
    byId?: string | null;
    projectCode?: string | null; // allowed only when direction === "OUT"
    equipment?: {
      typeCode?: string;
      assetNumber?: number;
    };
  };
  touchEquipment?: boolean;
};

type PatchResponse = {
  status: number;
  updated?: {
    movementId: string;
    equipmentId: string | null;
  };
  error?: string;
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json<PatchResponse>({ status: auth.status, error: "Forbidden" });

  const id = params?.id;
  if (!id) return NextResponse.json<PatchResponse>({ status: 400, error: "Missing id" });

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<PatchResponse>({ status: 400, error: "Invalid JSON body" });
  }

  const { data, touchEquipment = false } = body || {};
  if (!data) return NextResponse.json<PatchResponse>({ status: 400, error: "Missing data" });

  // Load current movement + equipment snapshot
  const movement = await prisma.equipmentMovement.findUnique({
    where: { id },
    include: { equipment: true },
  });
  if (!movement) return NextResponse.json<PatchResponse>({ status: 404, error: "Movement not found" });

  // Build movement updates
  const movementUpdate: Record<string, any> = {};
  if (typeof data.note !== "undefined") movementUpdate.note = data.note;
  if (typeof data.byId !== "undefined") movementUpdate.byId = data.byId;

  if (typeof data.at !== "undefined") {
    const dt = new Date(data.at);
    if (isNaN(dt.getTime())) {
      return NextResponse.json<PatchResponse>({ status: 400, error: "Invalid 'at' date/time" });
    }
    movementUpdate.at = dt;
  }

  // Only allow projectCode update on OUT
  if (typeof data.projectCode !== "undefined") {
    if (movement.direction !== "OUT") {
      return NextResponse.json<PatchResponse>({
        status: 400,
        error: "projectCode can only be updated for OUT (DEPLOY) movements",
      });
    }
    const trimmed = (data.projectCode ?? "").trim();
    if (!trimmed) {
      return NextResponse.json<PatchResponse>({ status: 400, error: "projectCode is required for OUT movements" });
    }
    movementUpdate.projectCode = trimmed;
  }

  // Optional equipment identity updates (typo fixes)
  const wantsEquipUpdate =
    !!data.equipment &&
    (typeof data.equipment.typeCode !== "undefined" ||
      typeof data.equipment.assetNumber !== "undefined");

  let newTypeCode = movement.equipment?.typeCode ?? undefined;
  let newAssetNumber = movement.equipment?.assetNumber ?? undefined;

  if (wantsEquipUpdate) {
    if (typeof data.equipment?.typeCode !== "undefined") {
      const t = String(data.equipment.typeCode || "").trim();
      if (!t) {
        return NextResponse.json<PatchResponse>({ status: 400, error: "equipment.typeCode cannot be empty" });
      }
      newTypeCode = t;
    }
    if (typeof data.equipment?.assetNumber !== "undefined") {
      const n = Number(data.equipment.assetNumber);
      if (!Number.isInteger(n) || n <= 0) {
        return NextResponse.json<PatchResponse>({ status: 400, error: "equipment.assetNumber must be a positive integer" });
      }
      newAssetNumber = n;
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) Update movement
      const updatedMovement = await tx.equipmentMovement.update({
        where: { id: movement.id },
        data: movementUpdate,
        include: { equipment: true },
      });

      // 2) If requested, update the linked equipment identity fields
      if (wantsEquipUpdate && updatedMovement.equipmentId) {
        await tx.equipment.update({
          where: { id: updatedMovement.equipmentId },
          data: {
            ...(typeof newTypeCode !== "undefined" ? { typeCode: newTypeCode } : {}),
            ...(typeof newAssetNumber !== "undefined" ? { assetNumber: newAssetNumber } : {}),
          },
        });
      }

      // 3) Optionally re-derive equipment denorm fields so other pages stay in sync
      if (touchEquipment && updatedMovement.equipmentId) {
        // Determine last movement chronologically for this equipment
        const last = await tx.equipmentMovement.findFirst({
          where: { equipmentId: updatedMovement.equipmentId },
          orderBy: { at: "desc" },
        });

        // Compute status/currentProjectCode/lastMovedAt from the latest movement
        let status: string | undefined;
        let currentProjectCode: string | null | undefined;
        let lastMovedAt: Date | undefined;

        if (last) {
          lastMovedAt = last.at;

          if (last.direction === "OUT") {
            status = "DEPLOYED";
            currentProjectCode = last.projectCode ?? null;
          } else {
            status = "WAREHOUSE";
            currentProjectCode = null;
          }
        }

        // Shape matches your EquipmentUpdateInput (all scalars)
        await tx.equipment.update({
          where: { id: updatedMovement.equipmentId },
          data: {
            ...(typeof status !== "undefined" ? { status } : {}),
            ...(typeof currentProjectCode !== "undefined" ? { currentProjectCode } : {}),
            ...(typeof lastMovedAt !== "undefined" ? { lastMovedAt } : {}),
          },
        });
      }

      return { movementId: updatedMovement.id, equipmentId: updatedMovement.equipmentId };
    });

    return NextResponse.json<PatchResponse>({ status: 200, updated: result });
  } catch (e: any) {
    // Nice message for unique constraint collisions on (typeCode, assetNumber)
    const msg =
      e?.code === "P2002"
        ? "Another equipment already uses this TypeCode + Asset #."
        : "Update failed";
    return NextResponse.json<PatchResponse>({ status: 500, error: msg });
  }
}
