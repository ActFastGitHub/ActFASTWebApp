// app/api/equipment/movements/[id]/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import type { DeleteResponse } from "@/app/types/equipment";
import { isAdminRole } from "@/app/libs/roles";
import {
  buildChangeSet,
  createAuditLog,
  getRequestAuditMeta,
} from "@/app/libs/auditLog";

/* ──────────────────────────────────────────────────────────── */
/*  Auth helpers                                                */
/* ──────────────────────────────────────────────────────────── */

async function getAdminProfile() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      ok: false,
      status: 401 as 401 | 403,
      session: null,
      profile: null,
    };
  }

  const profile = await prisma.profile.findUnique({
    where: { userEmail: session.user.email },
    select: {
      role: true,
      nickname: true,
      firstName: true,
    },
  });

  return {
    ok: isAdminRole(profile?.role),
    status: 403 as 401 | 403,
    session,
    profile,
  };
}

/* ──────────────────────────────────────────────────────────── */
/*  DELETE                                                      */
/* ──────────────────────────────────────────────────────────── */

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await getAdminProfile();

  if (!auth.ok || !auth.session?.user?.email) {
    return NextResponse.json<DeleteResponse>({
      status: auth.status,
      error: "Forbidden",
    });
  }

  if (!params?.id) {
    return NextResponse.json<DeleteResponse>({
      status: 400,
      error: "Missing id",
    });
  }

  try {
    const existing = await prisma.equipmentMovement.findUnique({
      where: { id: params.id },
      include: {
        equipment: true,
      },
    });

    if (!existing) {
      return NextResponse.json<DeleteResponse>(
        {
          status: 400,
          error: "Movement not found",
        },
        { status: 404 },
      );
    }

    await prisma.equipmentMovement.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      actorEmail: auth.session.user.email,
      actorNickname: auth.profile?.nickname || auth.profile?.firstName || null,
      actorRole: auth.profile?.role || null,
      action: "DELETE",
      entity: "EquipmentMovement",
      entityId: existing.id,
      projectCode: existing.projectCode || null,
      summary: `Deleted equipment movement`,
      changes: existing,
      ...getRequestAuditMeta(req),
    });

    return NextResponse.json<DeleteResponse>({ status: 200 });
  } catch {
    return NextResponse.json<DeleteResponse>({
      status: 500,
      error: "Delete failed",
    });
  }
}

/* ──────────────────────────────────────────────────────────── */
/*  PATCH                                                       */
/* ──────────────────────────────────────────────────────────── */

type PatchBody = {
  data?: {
    at?: string;
    note?: string | null;
    byId?: string | null;
    projectCode?: string | null;
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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const auth = await getAdminProfile();

  if (!auth.ok || !auth.session?.user?.email) {
    return NextResponse.json<PatchResponse>({
      status: auth.status,
      error: "Forbidden",
    });
  }

  const id = params?.id;

  if (!id) {
    return NextResponse.json<PatchResponse>({
      status: 400,
      error: "Missing id",
    });
  }

  let body: PatchBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json<PatchResponse>({
      status: 400,
      error: "Invalid JSON body",
    });
  }

  const { data, touchEquipment = false } = body || {};

  if (!data) {
    return NextResponse.json<PatchResponse>({
      status: 400,
      error: "Missing data",
    });
  }

  const movement = await prisma.equipmentMovement.findUnique({
    where: { id },
    include: { equipment: true },
  });

  if (!movement) {
    return NextResponse.json<PatchResponse>({
      status: 404,
      error: "Movement not found",
    });
  }

  const beforeMovement = structuredClone(movement);

  const movementUpdate: Record<string, any> = {};

  if (typeof data.note !== "undefined") {
    movementUpdate.note = data.note;
  }

  if (typeof data.byId !== "undefined") {
    movementUpdate.byId = data.byId;
  }

  if (typeof data.at !== "undefined") {
    const dt = new Date(data.at);

    if (isNaN(dt.getTime())) {
      return NextResponse.json<PatchResponse>({
        status: 400,
        error: "Invalid 'at' date/time",
      });
    }

    movementUpdate.at = dt;
  }

  if (typeof data.projectCode !== "undefined") {
    if (movement.direction !== "OUT") {
      return NextResponse.json<PatchResponse>({
        status: 400,
        error: "projectCode can only be updated for OUT (DEPLOY) movements",
      });
    }

    const trimmed = (data.projectCode ?? "").trim();

    if (!trimmed) {
      return NextResponse.json<PatchResponse>({
        status: 400,
        error: "projectCode is required for OUT movements",
      });
    }

    movementUpdate.projectCode = trimmed;
  }

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
        return NextResponse.json<PatchResponse>({
          status: 400,
          error: "equipment.typeCode cannot be empty",
        });
      }

      newTypeCode = t;
    }

    if (typeof data.equipment?.assetNumber !== "undefined") {
      const n = Number(data.equipment.assetNumber);

      if (!Number.isInteger(n) || n <= 0) {
        return NextResponse.json<PatchResponse>({
          status: 400,
          error: "equipment.assetNumber must be a positive integer",
        });
      }

      newAssetNumber = n;
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedMovement = await tx.equipmentMovement.update({
        where: { id: movement.id },
        data: movementUpdate,
        include: { equipment: true },
      });

      if (wantsEquipUpdate && updatedMovement.equipmentId) {
        await tx.equipment.update({
          where: { id: updatedMovement.equipmentId },
          data: {
            ...(typeof newTypeCode !== "undefined"
              ? { typeCode: newTypeCode }
              : {}),
            ...(typeof newAssetNumber !== "undefined"
              ? { assetNumber: newAssetNumber }
              : {}),
          },
        });
      }

      if (touchEquipment && updatedMovement.equipmentId) {
        const last = await tx.equipmentMovement.findFirst({
          where: { equipmentId: updatedMovement.equipmentId },
          orderBy: { at: "desc" },
        });

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

        await tx.equipment.update({
          where: { id: updatedMovement.equipmentId },
          data: {
            ...(typeof status !== "undefined" ? { status } : {}),
            ...(typeof currentProjectCode !== "undefined"
              ? { currentProjectCode }
              : {}),
            ...(typeof lastMovedAt !== "undefined" ? { lastMovedAt } : {}),
          },
        });
      }

      return {
        movementId: updatedMovement.id,
        equipmentId: updatedMovement.equipmentId,
      };
    });

    const afterMovement = await prisma.equipmentMovement.findUnique({
      where: { id: movement.id },
      include: { equipment: true },
    });

    await createAuditLog({
      actorEmail: auth.session.user.email,
      actorNickname: auth.profile?.nickname || auth.profile?.firstName || null,
      actorRole: auth.profile?.role || null,
      action: "UPDATE",
      entity: "EquipmentMovement",
      entityId: movement.id,
      projectCode: afterMovement?.projectCode || movement.projectCode || null,
      summary: `Updated equipment movement`,
      changes: buildChangeSet(beforeMovement as any, afterMovement as any),
      ...getRequestAuditMeta(req),
    });

    return NextResponse.json<PatchResponse>({
      status: 200,
      updated: result,
    });
  } catch (e: any) {
    const msg =
      e?.code === "P2002"
        ? "Another equipment already uses this TypeCode + Asset #."
        : "Update failed";

    return NextResponse.json<PatchResponse>({
      status: 500,
      error: msg,
    });
  }
}
