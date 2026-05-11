// app/api/projects/subcontractor/[id]/route.tsx

export const runtime = "nodejs";

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

function toNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const subcontractor = await prisma.subcontractor.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            nickname: true,
          },
        },
        lastModifiedBy: {
          select: {
            firstName: true,
            lastName: true,
            nickname: true,
          },
        },
      },
    });

    if (!subcontractor) {
      return jsonError("Subcontractor not found", 404);
    }

    return NextResponse.json({
      subcontractor,
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching subcontractor:", error);

    return jsonError(
      "Internal server error",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
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

    const existingSubcontractor = await prisma.subcontractor.findUnique({
      where: { id },
    });

    if (!existingSubcontractor) {
      return jsonError("Subcontractor not found", 404);
    }

    const projectCode = cleanString(data.projectCode);
    const name = cleanString(data.name);

    if (!projectCode) {
      return jsonError("projectCode is required", 400);
    }

    if (!name) {
      return jsonError("Subcontractor name cannot be empty", 400);
    }

    const updateData = {
      projectCode,
      name,
      expertise: cleanString(data.expertise),
      contactInfo: nullableString(data.contactInfo),
      agreedCost: toNumber(data.agreedCost, 0),
      lastModifiedById: profile.nickname || null,
      lastModifiedAt: new Date(),
    };

    const changes = buildChangeSet(
      existingSubcontractor as any,
      updateData as any,
    );

    const updatedSubcontractor = await prisma.subcontractor.update({
      where: { id },
      data: updateData,
    });

    await recalcProjectCosts(existingSubcontractor.projectCode);

    if (
      existingSubcontractor.projectCode !== updatedSubcontractor.projectCode
    ) {
      await recalcProjectCosts(updatedSubcontractor.projectCode);
    }

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: profile.role || null,
      action: "UPDATE",
      entity: "Subcontractor",
      entityId: updatedSubcontractor.id,
      projectCode: updatedSubcontractor.projectCode,
      summary: `Updated subcontractor: ${updatedSubcontractor.name}`,
      changes,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      subcontractor: updatedSubcontractor,
      status: 200,
    });
  } catch (error) {
    console.error("Error updating subcontractor:", error);

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

    const existingSubcontractor = await prisma.subcontractor.findUnique({
      where: { id },
    });

    if (!existingSubcontractor) {
      return jsonError("Subcontractor not found", 404);
    }

    const deletedSubcontractor = await prisma.subcontractor.delete({
      where: { id },
    });

    await recalcProjectCosts(existingSubcontractor.projectCode);

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: profile.role || null,
      action: "DELETE",
      entity: "Subcontractor",
      entityId: deletedSubcontractor.id,
      projectCode: deletedSubcontractor.projectCode,
      summary: `Deleted subcontractor: ${deletedSubcontractor.name}`,
      changes: deletedSubcontractor,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      message: "Subcontractor deleted",
      subcontractor: deletedSubcontractor,
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting subcontractor:", error);

    return jsonError(
      "Internal server error",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
