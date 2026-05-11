// app/api/projects/materials/[id]/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { recalcProjectCosts } from "@/app/utils/recalcProjectCosts";
import { canManageFinalRepairs } from "@/app/libs/roles";
import {
  buildChangeSet,
  createAuditLog,
  getRequestAuditMeta,
} from "@/app/libs/auditLog";

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

function cleanString(value: unknown) {
  return String(value || "").trim();
}

function nullableString(value: unknown) {
  const cleaned = cleanString(value);
  return cleaned || null;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized access", 401);
  }

  try {
    const profile = await getCurrentProfile(session.user.email);

    if (!profile) {
      return jsonError("User profile not found", 404);
    }

    if (!canManageFinalRepairs(profile.role)) {
      return jsonError("Admin access required", 403);
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const data = body.data;

    if (!data) {
      return jsonError("No data provided", 400);
    }

    const existingMaterial = await prisma.material.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      return jsonError("Material not found", 404);
    }

    const projectCode = cleanString(data.projectCode);
    const type = cleanString(data.type);

    if (!projectCode) {
      return jsonError("projectCode is required", 400);
    }

    if (!type) {
      return jsonError("Material 'type' cannot be empty", 400);
    }

    const quantityOrdered = toNumber(data.quantityOrdered, 0);
    const costPerUnit = toNumber(data.costPerUnit, 0);
    const computedCost = quantityOrdered * costPerUnit;

    const updateData = {
      projectCode,
      type,
      description: nullableString(data.description),
      unitOfMeasurement: nullableString(data.unitOfMeasurement),
      quantityOrdered,
      costPerUnit,
      totalCost: computedCost,
      supplierName: nullableString(data.supplierName),
      supplierContact: nullableString(data.supplierContact),
      status: nullableString(data.status),
      lastModifiedById: profile.nickname || null,
      lastModifiedAt: new Date(),
    };

    const changes = buildChangeSet(existingMaterial as any, updateData as any);

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: updateData,
    });

    await recalcProjectCosts(existingMaterial.projectCode);

    if (existingMaterial.projectCode !== updatedMaterial.projectCode) {
      await recalcProjectCosts(updatedMaterial.projectCode);
    }

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: profile.role || null,
      action: "UPDATE",
      entity: "Material",
      entityId: updatedMaterial.id,
      projectCode: updatedMaterial.projectCode,
      summary: `Updated material: ${updatedMaterial.name}`,
      changes,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      material: updatedMaterial,
      status: 200,
    });
  } catch (error) {
    console.error("Error updating material:", error);

    return jsonError(
      "Internal server error",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized access", 401);
  }

  try {
    const profile = await getCurrentProfile(session.user.email);

    if (!profile) {
      return jsonError("User profile not found", 404);
    }

    if (!canManageFinalRepairs(profile.role)) {
      return jsonError("Admin access required", 403);
    }

    const { id } = params;

    const existingMaterial = await prisma.material.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      return jsonError("Material not found", 404);
    }

    const deletedMaterial = await prisma.material.delete({
      where: { id },
    });

    await recalcProjectCosts(existingMaterial.projectCode);

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: profile.role || null,
      action: "DELETE",
      entity: "Material",
      entityId: deletedMaterial.id,
      projectCode: deletedMaterial.projectCode,
      summary: `Deleted material: ${deletedMaterial.name}`,
      changes: deletedMaterial,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      message: "Material deleted",
      material: deletedMaterial,
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting material:", error);

    return jsonError(
      "Internal server error",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
