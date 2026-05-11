// app\api\final-repairs-agreements\catalog\route.ts

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

function cleanString(value: unknown) {
  return String(value || "").trim();
}

function nullableString(value: unknown) {
  const cleaned = cleanString(value);
  return cleaned || null;
}

function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanString(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => cleanString(item))
      .filter(Boolean);
  }

  return [];
}

function toSafeSource(value: unknown) {
  const source = cleanString(value || "MANUAL").toUpperCase();

  if (
    ["MANUAL", "AGREEMENT_SELECTION", "IMPORTED", "AI_SUGGESTED"].includes(
      source,
    )
  ) {
    return source;
  }

  return "MANUAL";
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const { searchParams } = new URL(request.url);

    const category = cleanString(searchParams.get("category"));
    const defaultSection = cleanString(searchParams.get("defaultSection"));
    const room = cleanString(searchParams.get("room"));
    const search = cleanString(searchParams.get("search")).toLowerCase();

    const includeInactive = searchParams.get("includeInactive") === "1";

    const catalogItems = await prisma.materialCatalogItem.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(defaultSection ? { defaultSection } : {}),
        ...(includeInactive ? {} : { active: true }),
      },
      orderBy: [{ usageCount: "desc" }, { itemName: "asc" }],
      take: 1000,
    });

    const filteredItems = catalogItems.filter((item) => {
      if (room) {
        const recommendedRooms = item.recommendedRooms || [];
        const matchesRoom = recommendedRooms.some(
          (recommendedRoom) =>
            recommendedRoom.toLowerCase() === room.toLowerCase(),
        );

        if (!matchesRoom) return false;
      }

      if (!search) return true;

      const text = [
        item.category,
        item.defaultSection,
        item.itemName,
        item.description,
        item.supplierName,
        item.modelNumber,
        item.colorName,
        item.size,
        item.unit,
        item.notes,
        item.source,
        ...(item.recommendedRooms || []),
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(search);
    });

    return NextResponse.json({
      status: 200,
      catalogItems: filteredItems,
    });
  } catch (error) {
    console.error("LOAD MATERIAL CATALOG ERROR:", error);

    return jsonError(
      "Failed to load material catalog",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
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

    const category = cleanString(body.category);
    const itemName = cleanString(body.itemName);

    if (!category) return jsonError("Category is required", 400);
    if (!itemName) return jsonError("Item name is required", 400);

    const catalogItem = await prisma.materialCatalogItem.create({
      data: {
        category,
        defaultSection: nullableString(body.defaultSection),
        recommendedRooms: toStringArray(body.recommendedRooms),
        tags: toStringArray(body.tags),

        itemName,
        description: nullableString(body.description),
        supplierName: nullableString(body.supplierName),
        modelNumber: nullableString(body.modelNumber),
        colorName: nullableString(body.colorName),
        size: nullableString(body.size),
        unit: nullableString(body.unit),
        defaultCost: toOptionalNumber(body.defaultCost),
        notes: nullableString(body.notes),

        active: body.active === undefined ? true : Boolean(body.active),

        usageCount: Number.isFinite(Number(body.usageCount))
          ? Number(body.usageCount)
          : 0,

        lastUsedAt: body.lastUsedAt ? new Date(body.lastUsedAt) : null,

        source: toSafeSource(body.source),

        createdById: profile?.nickname || null,
        lastModifiedById: profile?.nickname || null,
      },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "CREATE",
      entity: "MaterialCatalogItem",
      entityId: catalogItem.id,
      summary: `Created catalog item: ${catalogItem.itemName}`,
      changes: catalogItem,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      status: 200,
      message: "Catalog item created",
      catalogItem,
    });
  } catch (error) {
    console.error("CREATE MATERIAL CATALOG ITEM ERROR:", error);

    return jsonError(
      "Failed to create catalog item",
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
    const catalogItemId = cleanString(body.catalogItemId);

    if (!catalogItemId) {
      return jsonError("Catalog item ID is required", 400);
    }

    const existing = await prisma.materialCatalogItem.findUnique({
      where: { id: catalogItemId },
    });

    if (!existing) {
      return jsonError("Catalog item not found", 404);
    }

    const updateData = {
      category:
        body.category !== undefined
          ? cleanString(body.category)
          : existing.category,

      defaultSection:
        body.defaultSection !== undefined
          ? nullableString(body.defaultSection)
          : existing.defaultSection,

      recommendedRooms:
        body.recommendedRooms !== undefined
          ? toStringArray(body.recommendedRooms)
          : existing.recommendedRooms,

      tags: body.tags !== undefined ? toStringArray(body.tags) : existing.tags,

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

      defaultCost:
        body.defaultCost !== undefined
          ? toOptionalNumber(body.defaultCost)
          : existing.defaultCost,

      notes:
        body.notes !== undefined ? nullableString(body.notes) : existing.notes,

      active:
        body.active !== undefined ? Boolean(body.active) : existing.active,

      usageCount:
        body.usageCount !== undefined &&
        Number.isFinite(Number(body.usageCount))
          ? Number(body.usageCount)
          : existing.usageCount,

      lastUsedAt:
        body.lastUsedAt !== undefined
          ? body.lastUsedAt
            ? new Date(body.lastUsedAt)
            : null
          : existing.lastUsedAt,

      source:
        body.source !== undefined ? toSafeSource(body.source) : existing.source,

      lastModifiedById: profile?.nickname || null,
    };

    const changes = buildChangeSet(existing as any, updateData as any);

    const updated = await prisma.materialCatalogItem.update({
      where: { id: catalogItemId },
      data: updateData,
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "UPDATE",
      entity: "MaterialCatalogItem",
      entityId: updated.id,
      summary: `Updated catalog item: ${updated.itemName}`,
      changes,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      status: 200,
      message: "Catalog item updated",
      catalogItem: updated,
    });
  } catch (error) {
    console.error("UPDATE MATERIAL CATALOG ITEM ERROR:", error);

    return jsonError(
      "Failed to update catalog item",
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
    const catalogItemId = cleanString(body.catalogItemId);

    if (!catalogItemId) {
      return jsonError("Catalog item ID is required", 400);
    }

    const existing = await prisma.materialCatalogItem.findUnique({
      where: { id: catalogItemId },
    });

    if (!existing) {
      return jsonError("Catalog item not found", 404);
    }

    const disabled = await prisma.materialCatalogItem.update({
      where: { id: catalogItemId },
      data: {
        active: false,
        lastModifiedById: profile?.nickname || null,
      },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "DELETE",
      entity: "MaterialCatalogItem",
      entityId: disabled.id,
      summary: `Disabled catalog item: ${disabled.itemName}`,
      changes: {
        active: {
          before: existing.active,
          after: false,
        },
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      status: 200,
      message: "Catalog item disabled",
      catalogItem: disabled,
    });
  } catch (error) {
    console.error("DISABLE MATERIAL CATALOG ITEM ERROR:", error);

    return jsonError(
      "Failed to disable catalog item",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
