// app/api/pods/items/[id]/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import {
  buildChangeSet,
  createAuditLog,
  getRequestAuditMeta,
} from "@/app/libs/auditLog";
import { normalizeRole } from "@/app/libs/roles";

// GET SPECIFIC ITEM
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        lastModifiedBy: true,
        addedBy: true,
        box: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found", status: 404 },
        { status: 404 },
      );
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error("GET ITEM ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error", status: 500 },
      { status: 500 },
    );
  }
}

// UPDATE SPECIFIC ITEM
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      {
        message: "Unauthorized access",
        status: 401,
      },
      { status: 401 },
    );
  }

  try {
    const { id } = params;
    const body = await request.json();

    const { name, description, location, boxed, category, projectCode, notes } =
      body.data || {};

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          message: "Item name is required",
          status: 400,
        },
        { status: 400 },
      );
    }

    if (!projectCode) {
      return NextResponse.json(
        {
          message: "Project code is required",
          status: 400,
        },
        { status: 400 },
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: {
        nickname: true,
        firstName: true,
        role: true,
      },
    });

    if (!profile?.nickname) {
      return NextResponse.json(
        {
          message: "Profile not found",
          status: 404,
        },
        { status: 404 },
      );
    }

    const existing = await prisma.item.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          message: "Item not found",
          status: 404,
        },
        { status: 404 },
      );
    }

    const trimmedName = name.trim();

    const duplicateItem = await prisma.item.findFirst({
      where: {
        name: trimmedName,
        projectCode,
        NOT: {
          id,
        },
      },
    });

    if (duplicateItem) {
      return NextResponse.json(
        {
          message: "This item name already exists in this project.",
          status: 400,
        },
        { status: 400 },
      );
    }

    const updateData = {
      name: trimmedName,
      description,
      location,
      boxed,
      category,
      projectCode,
      notes,
    };

    const changes = buildChangeSet(existing as any, updateData as any);

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        ...updateData,
        lastModifiedBy: {
          connect: { nickname: profile.nickname },
        },
      },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: normalizeRole(profile.role),
      action: "UPDATE",
      entity: "Item",
      entityId: updatedItem.id,
      projectCode: updatedItem.projectCode,
      summary: `Updated item "${updatedItem.name}"`,
      changes,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json(
      {
        updatedItem,
        status: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("UPDATE ITEM ERROR:", error);

    return NextResponse.json(
      {
        status: 500,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// DELETE SPECIFIC ITEM
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      {
        message: "Unauthorized access",
        status: 401,
      },
      { status: 401 },
    );
  }

  try {
    const { id } = params;

    const profile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: {
        nickname: true,
        firstName: true,
        role: true,
      },
    });

    if (!profile?.nickname) {
      return NextResponse.json(
        {
          message: "Profile not found",
          status: 404,
        },
        { status: 404 },
      );
    }

    const existing = await prisma.item.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          message: "Item not found",
          status: 404,
        },
        { status: 404 },
      );
    }

    const deletedItem = await prisma.item.delete({
      where: { id },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: normalizeRole(profile.role),
      action: "DELETE",
      entity: "Item",
      entityId: deletedItem.id,
      projectCode: deletedItem.projectCode,
      summary: `Deleted item "${deletedItem.name}"`,
      changes: {
        deleted: deletedItem,
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json(
      {
        message: "Item deleted",
        deletedItem,
        status: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE ITEM ERROR:", error);

    return NextResponse.json(
      {
        status: 500,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
