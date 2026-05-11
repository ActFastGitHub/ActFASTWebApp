// app/api/officesupply/[id]/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import {
  buildChangeSet,
  createAuditLog,
  getRequestAuditMeta,
} from "@/app/libs/auditLog";

/**
 * PATCH - Update an OfficeSupply item by ID
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const { id } = params;
    const { data } = await request.json();

    if (!data) {
      return NextResponse.json({ message: "No data provided", status: 400 });
    }

    const { name, description, category, status, quantity } = data;

    const userProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: {
        nickname: true,
        firstName: true,
        role: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({
        status: 404,
        error: "User profile not found",
      });
    }

    const existing = await prisma.officeSupply.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({
        status: 404,
        error: "OfficeSupply not found",
      });
    }

    let statusUpdatedAt: Date | undefined;

    if (typeof status === "string") {
      statusUpdatedAt = new Date();
    }

    const updateData = {
      name,
      description,
      category,
      status,
      quantity,
      ...(statusUpdatedAt && { statusUpdatedAt }),
      lastUpdatedById: userProfile.nickname,
      updatedAt: new Date(),
    };

    const changes = buildChangeSet(existing as any, updateData as any);

    const updatedSupply = await prisma.officeSupply.update({
      where: { id },
      data: updateData,
      include: {
        lastUpdatedBy: {
          select: { firstName: true, lastName: true, nickname: true },
        },
      },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: userProfile.nickname || userProfile.firstName || null,
      actorRole: userProfile.role || null,
      action: "UPDATE",
      entity: "OfficeSupply",
      entityId: updatedSupply.id,
      summary: `Updated office supply: ${updatedSupply.name}`,
      changes,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({ officeSupply: updatedSupply, status: 200 });
  } catch (error) {
    console.error("Error updating office supply:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}

/**
 * DELETE - Remove an OfficeSupply item by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const { id } = params;

    const userProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: {
        nickname: true,
        firstName: true,
        role: true,
      },
    });

    const existing = await prisma.officeSupply.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({
        status: 404,
        error: "OfficeSupply not found",
      });
    }

    await prisma.officeSupply.delete({ where: { id } });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: userProfile?.nickname || userProfile?.firstName || null,
      actorRole: userProfile?.role || null,
      action: "DELETE",
      entity: "OfficeSupply",
      entityId: existing.id,
      summary: `Deleted office supply: ${existing.name}`,
      changes: existing,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({ message: "OfficeSupply deleted", status: 200 });
  } catch (error) {
    console.error("Error deleting office supply:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}
