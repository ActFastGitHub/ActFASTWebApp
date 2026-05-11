// app/api/final-repairs-agreements/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import {
  createAuditLog,
  getRequestAuditMeta,
  buildChangeSet,
} from "@/app/libs/auditLog";
import { canManageFinalRepairs } from "@/app/libs/roles";

export const runtime = "nodejs";

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

function jsonError(message: string, status: number, detail?: string) {
  return NextResponse.json({ message, detail, status }, { status });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectCode = String(searchParams.get("projectCode") || "").trim();
    const includeDeleted = searchParams.get("includeDeleted") === "1";

    const agreements = await prisma.finalRepairsAgreement.findMany({
      where: {
        ...(projectCode ? { projectCode } : {}),
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: {
        selections: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    });

    return NextResponse.json({
      status: 200,
      agreements,
    });
  } catch (error) {
    return jsonError(
      "Failed to load Final Repairs Agreements",
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

    const projectCode = String(body.projectCode || "").trim();

    if (!projectCode) {
      return jsonError("Project code is required", 400);
    }

    const project = await prisma.project.findUnique({
      where: { code: projectCode },
      select: { code: true },
    });

    if (!project) {
      return jsonError("Project does not exist", 404);
    }

    const agreement = await prisma.finalRepairsAgreement.create({
      data: {
        projectCode,
        agreementNumber: body.agreementNumber || null,

        customerName: body.customerName || null,
        customerEmail: body.customerEmail || null,
        customerPhone: body.customerPhone || null,

        status: body.status || "DRAFT",
        generalNotes: body.generalNotes || null,

        dropboxFolderPath: body.dropboxFolderPath || null,
        dropboxDocumentPath: body.dropboxDocumentPath || null,
        signedDocumentPath: body.signedDocumentPath || null,

        signedAt: body.signedAt || null,
        signedBy: body.signedBy || null,

        createdById: profile?.nickname || null,
        lastModifiedById: profile?.nickname || null,
      },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "CREATE",
      entity: "FinalRepairsAgreement",
      entityId: agreement.id,
      projectCode,
      summary: `Created Final Repairs Agreement for ${projectCode}`,
      changes: agreement,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      status: 200,
      message: "Final Repairs Agreement created",
      agreement,
    });
  } catch (error) {
    return jsonError(
      "Failed to create Final Repairs Agreement",
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
    const agreementId = String(body.agreementId || "").trim();

    if (!agreementId) {
      return jsonError("Agreement ID is required", 400);
    }

    const existing = await prisma.finalRepairsAgreement.findUnique({
      where: { id: agreementId },
    });

    if (!existing || existing.isDeleted) {
      return jsonError("Final Repairs Agreement not found", 404);
    }

    const updateData = {
      agreementNumber:
        body.agreementNumber !== undefined
          ? body.agreementNumber || null
          : existing.agreementNumber,

      customerName:
        body.customerName !== undefined
          ? body.customerName || null
          : existing.customerName,

      customerEmail:
        body.customerEmail !== undefined
          ? body.customerEmail || null
          : existing.customerEmail,

      customerPhone:
        body.customerPhone !== undefined
          ? body.customerPhone || null
          : existing.customerPhone,

      status:
        body.status !== undefined ? body.status || "DRAFT" : existing.status,

      generalNotes:
        body.generalNotes !== undefined
          ? body.generalNotes || null
          : existing.generalNotes,

      dropboxFolderPath:
        body.dropboxFolderPath !== undefined
          ? body.dropboxFolderPath || null
          : existing.dropboxFolderPath,

      dropboxDocumentPath:
        body.dropboxDocumentPath !== undefined
          ? body.dropboxDocumentPath || null
          : existing.dropboxDocumentPath,

      signedDocumentPath:
        body.signedDocumentPath !== undefined
          ? body.signedDocumentPath || null
          : existing.signedDocumentPath,

      signedAt:
        body.signedAt !== undefined ? body.signedAt || null : existing.signedAt,

      signedBy:
        body.signedBy !== undefined ? body.signedBy || null : existing.signedBy,

      lastModifiedById: profile?.nickname || null,
    };

    const changes = buildChangeSet(existing as any, updateData as any);

    const updated = await prisma.finalRepairsAgreement.update({
      where: { id: agreementId },
      data: updateData,
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "UPDATE",
      entity: "FinalRepairsAgreement",
      entityId: updated.id,
      projectCode: updated.projectCode,
      summary: `Updated Final Repairs Agreement for ${updated.projectCode}`,
      changes,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      status: 200,
      message: "Final Repairs Agreement updated",
      agreement: updated,
    });
  } catch (error) {
    return jsonError(
      "Failed to update Final Repairs Agreement",
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
    const agreementId = String(body.agreementId || "").trim();

    if (!agreementId) {
      return jsonError("Agreement ID is required", 400);
    }

    const existing = await prisma.finalRepairsAgreement.findUnique({
      where: { id: agreementId },
    });

    if (!existing || existing.isDeleted) {
      return jsonError("Final Repairs Agreement not found", 404);
    }

    const deleted = await prisma.finalRepairsAgreement.update({
      where: { id: agreementId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: profile?.nickname || null,
      },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "DELETE",
      entity: "FinalRepairsAgreement",
      entityId: deleted.id,
      projectCode: deleted.projectCode,
      summary: `Soft-deleted Final Repairs Agreement for ${deleted.projectCode}`,
      changes: {
        isDeleted: {
          before: false,
          after: true,
        },
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      status: 200,
      message: "Final Repairs Agreement deleted",
      agreement: deleted,
    });
  } catch (error) {
    return jsonError(
      "Failed to delete Final Repairs Agreement",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
