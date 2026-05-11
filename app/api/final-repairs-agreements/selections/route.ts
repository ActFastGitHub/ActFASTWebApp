// app\api\final-repairs-agreements\selections\route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import {
  buildChangeSet,
  createAuditLog,
  getRequestAuditMeta,
} from "@/app/libs/auditLog";
import { canManageFinalRepairs } from "@/app/libs/roles";

export const runtime = "nodejs";

function jsonError(message: string, status: number, detail?: string) {
  return NextResponse.json({ message, detail, status }, { status });
}

async function getCurrentProfile(email: string) {
  return prisma.profile.findUnique({
    where: { userEmail: email },
    select: {
      nickname: true,
      firstName: true,
      role: true,
    },
  });
}

function toNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function toOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function cleanString(value: unknown) {
  return String(value || "").trim();
}

function nullableString(value: unknown) {
  const cleaned = cleanString(value);
  return cleaned || null;
}

function safeApprovalStatus(value: unknown) {
  const status = cleanString(value).toUpperCase();

  const allowed = ["PENDING", "APPROVED", "DECLINED", "ORDERED", "INSTALLED"];

  return allowed.includes(status) ? status : "PENDING";
}

function calculateTotalCost(quantity?: unknown, unitCost?: unknown) {
  return toNumber(quantity, 0) * toNumber(unitCost, 0);
}

async function updateCatalogUsage(catalogItemId?: string | null) {
  if (!catalogItemId) return;

  try {
    await prisma.materialCatalogItem.update({
      where: { id: catalogItemId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("CATALOG USAGE UPDATE ERROR:", error);
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const profile = await getCurrentProfile(session.user.email);

    if (!canManageFinalRepairs(profile?.role)) {
      return jsonError("Admin access required", 403);
    }

    const body = await request.json().catch(() => ({}));

    const agreementId = cleanString(body.agreementId);
    const catalogItemId = cleanString(body.catalogItemId) || null;
    const category = cleanString(body.category);
    const itemName = cleanString(body.itemName);

    if (!agreementId) return jsonError("Agreement ID is required", 400);
    if (!category) return jsonError("Category is required", 400);
    if (!itemName) return jsonError("Item name is required", 400);

    const agreement = await prisma.finalRepairsAgreement.findUnique({
      where: { id: agreementId },
    });

    if (!agreement || agreement.isDeleted) {
      return jsonError("Final Repairs Agreement not found", 404);
    }

    if (catalogItemId) {
      const catalogItem = await prisma.materialCatalogItem.findUnique({
        where: { id: catalogItemId },
        select: { id: true },
      });

      if (!catalogItem) {
        return jsonError("Selected catalog item was not found", 404);
      }
    }

    const quantity = toOptionalNumber(body.quantity);
    const unitCost = toOptionalNumber(body.unitCost);

    const selection = await prisma.finalRepairMaterialSelection.create({
      data: {
        agreementId,
        catalogItemId,
        projectCode: agreement.projectCode,

        roomName: nullableString(body.roomName),
        location: nullableString(body.location),
        section: nullableString(body.section),
        approvalStatus: safeApprovalStatus(body.approvalStatus),
        customerDecision: nullableString(body.customerDecision),

        category,
        itemName,
        description: nullableString(body.description),
        supplierName: nullableString(body.supplierName),
        modelNumber: nullableString(body.modelNumber),
        colorName: nullableString(body.colorName),
        size: nullableString(body.size),
        unit: nullableString(body.unit),

        quantity,
        unitCost,
        totalCost: calculateTotalCost(quantity, unitCost),
        allowanceAmount: toOptionalNumber(body.allowanceAmount),

        notes: nullableString(body.notes),
        sortOrder: toNumber(body.sortOrder, 0),
      },
    });

    await updateCatalogUsage(catalogItemId);

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "CREATE",
      entity: "FinalRepairMaterialSelection",
      entityId: selection.id,
      projectCode: agreement.projectCode,
      summary: `Added ${category} selection: ${itemName}`,
      changes: selection,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      status: 200,
      message: "Material selection added",
      selection,
    });
  } catch (error) {
    console.error("CREATE FINAL REPAIR SELECTION ERROR:", error);

    return jsonError(
      "Failed to add material selection",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const profile = await getCurrentProfile(session.user.email);

    if (!canManageFinalRepairs(profile?.role)) {
      return jsonError("Admin access required", 403);
    }

    const body = await request.json().catch(() => ({}));
    const selectionId = cleanString(body.selectionId);

    if (!selectionId) {
      return jsonError("Selection ID is required", 400);
    }

    const existing = await prisma.finalRepairMaterialSelection.findUnique({
      where: { id: selectionId },
    });

    if (!existing) {
      return jsonError("Material selection not found", 404);
    }

    const nextCatalogItemId =
      body.catalogItemId !== undefined
        ? cleanString(body.catalogItemId) || null
        : existing.catalogItemId;

    if (nextCatalogItemId) {
      const catalogItem = await prisma.materialCatalogItem.findUnique({
        where: { id: nextCatalogItemId },
        select: { id: true },
      });

      if (!catalogItem) {
        return jsonError("Selected catalog item was not found", 404);
      }
    }

    const nextQuantity =
      body.quantity !== undefined
        ? toOptionalNumber(body.quantity)
        : existing.quantity;

    const nextUnitCost =
      body.unitCost !== undefined
        ? toOptionalNumber(body.unitCost)
        : existing.unitCost;

    const updateData = {
      catalogItemId: nextCatalogItemId,

      roomName:
        body.roomName !== undefined
          ? nullableString(body.roomName)
          : existing.roomName,

      location:
        body.location !== undefined
          ? nullableString(body.location)
          : existing.location,

      section:
        body.section !== undefined
          ? nullableString(body.section)
          : existing.section,

      approvalStatus:
        body.approvalStatus !== undefined
          ? safeApprovalStatus(body.approvalStatus)
          : existing.approvalStatus,

      customerDecision:
        body.customerDecision !== undefined
          ? nullableString(body.customerDecision)
          : existing.customerDecision,

      category:
        body.category !== undefined
          ? cleanString(body.category)
          : existing.category,

      itemName:
        body.itemName !== undefined
          ? cleanString(body.itemName)
          : existing.itemName,

      description:
        body.description !== undefined
          ? nullableString(body.description)
          : existing.description,

      supplierName:
        body.supplierName !== undefined
          ? nullableString(body.supplierName)
          : existing.supplierName,

      modelNumber:
        body.modelNumber !== undefined
          ? nullableString(body.modelNumber)
          : existing.modelNumber,

      colorName:
        body.colorName !== undefined
          ? nullableString(body.colorName)
          : existing.colorName,

      size: body.size !== undefined ? nullableString(body.size) : existing.size,

      unit: body.unit !== undefined ? nullableString(body.unit) : existing.unit,

      quantity: nextQuantity,
      unitCost: nextUnitCost,
      totalCost: calculateTotalCost(nextQuantity, nextUnitCost),

      allowanceAmount:
        body.allowanceAmount !== undefined
          ? toOptionalNumber(body.allowanceAmount)
          : existing.allowanceAmount,

      notes:
        body.notes !== undefined ? nullableString(body.notes) : existing.notes,

      sortOrder:
        body.sortOrder !== undefined
          ? toNumber(body.sortOrder, 0)
          : existing.sortOrder,
    };

    const changes = buildChangeSet(existing as any, updateData as any);

    const updated = await prisma.finalRepairMaterialSelection.update({
      where: { id: selectionId },
      data: updateData,
    });

    if (nextCatalogItemId && nextCatalogItemId !== existing.catalogItemId) {
      await updateCatalogUsage(nextCatalogItemId);
    }

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "UPDATE",
      entity: "FinalRepairMaterialSelection",
      entityId: updated.id,
      projectCode: updated.projectCode,
      summary: `Updated material selection: ${updated.itemName}`,
      changes,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      status: 200,
      message: "Material selection updated",
      selection: updated,
    });
  } catch (error) {
    console.error("UPDATE FINAL REPAIR SELECTION ERROR:", error);

    return jsonError(
      "Failed to update material selection",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const profile = await getCurrentProfile(session.user.email);

    if (!canManageFinalRepairs(profile?.role)) {
      return jsonError("Admin access required", 403);
    }

    const body = await request.json().catch(() => ({}));
    const selectionId = cleanString(body.selectionId);

    if (!selectionId) {
      return jsonError("Selection ID is required", 400);
    }

    const existing = await prisma.finalRepairMaterialSelection.findUnique({
      where: { id: selectionId },
    });

    if (!existing) {
      return jsonError("Material selection not found", 404);
    }

    const deleted = await prisma.finalRepairMaterialSelection.delete({
      where: { id: selectionId },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "DELETE",
      entity: "FinalRepairMaterialSelection",
      entityId: deleted.id,
      projectCode: deleted.projectCode,
      summary: `Deleted material selection: ${deleted.itemName}`,
      changes: deleted,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      status: 200,
      message: "Material selection deleted",
      selection: deleted,
    });
  } catch (error) {
    console.error("DELETE FINAL REPAIR SELECTION ERROR:", error);

    return jsonError(
      "Failed to delete material selection",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
