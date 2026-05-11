// app\api\super-admin\backups\export\route.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import { canRunBackups } from "@/app/libs/roles";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";

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

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const profile = await getCurrentProfile(session.user.email);

  if (!canRunBackups(profile?.role)) {
    return new Response("Super Admin access required", { status: 403 });
  }

  let backupLogId: string | null = null;

  try {
    const backupLog = await prisma.backupLog.create({
      data: {
        requestedByEmail: session.user.email,
        requestedByNickname: profile?.nickname || profile?.firstName || null,
        backupType: "JSON_EXPORT",
        status: "STARTED",
        notes:
          "App-level JSON export. MongoDB Atlas backup should remain the primary recovery backup.",
      },
    });

    backupLogId = backupLog.id;

    const [
      projects,
      finalRepairsAgreements,
      finalRepairMaterialSelections,
      materialCatalogItems,
      materials,
      subcontractors,
      laborCosts,
      projectUpdates,
      auditLogs,
      backupLogs,
    ] = await Promise.all([
      prisma.project.findMany(),
      prisma.finalRepairsAgreement.findMany({
        include: { selections: true },
      }),
      prisma.finalRepairMaterialSelection.findMany(),
      prisma.materialCatalogItem.findMany(),
      prisma.material.findMany(),
      prisma.subcontractor.findMany(),
      prisma.laborCost.findMany(),
      prisma.projectUpdate.findMany(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10000,
      }),
      prisma.backupLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),
    ]);

    const backupData = {
      exportedAt: new Date().toISOString(),
      exportedBy: {
        email: session.user.email,
        nickname: profile?.nickname || profile?.firstName || null,
        role: profile?.role || null,
      },
      warning:
        "This is an app-level JSON export, not a full MongoDB binary restore backup.",
      collections: {
        projects,
        finalRepairsAgreements,
        finalRepairMaterialSelections,
        materialCatalogItems,
        materials,
        subcontractors,
        laborCosts,
        projectUpdates,
        auditLogs,
        backupLogs,
      },
    };

    const json = JSON.stringify(backupData, null, 2);
    const fileName = `actfast-app-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const recordCount =
      projects.length +
      finalRepairsAgreements.length +
      finalRepairMaterialSelections.length +
      materialCatalogItems.length +
      materials.length +
      subcontractors.length +
      laborCosts.length +
      projectUpdates.length +
      auditLogs.length +
      backupLogs.length;

    await prisma.backupLog.update({
      where: { id: backupLogId },
      data: {
        status: "SUCCESS",
        fileName,
        fileSize: Buffer.byteLength(json, "utf8"),
        recordCount,
        completedAt: new Date(),
      },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "BACKUP",
      entity: "BackupLog",
      entityId: backupLogId,
      summary: `Created JSON backup export with ${recordCount} record(s)`,
      changes: {
        fileName,
        recordCount,
      },
      ...getRequestAuditMeta(request),
    });

    return new Response(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    if (backupLogId) {
      await prisma.backupLog.update({
        where: { id: backupLogId },
        data: {
          status: "FAILED",
          errorMessage:
            error instanceof Error ? error.message : "Unknown backup error",
          completedAt: new Date(),
        },
      });
    }

    return new Response(
      error instanceof Error ? error.message : "Backup export failed",
      { status: 500 },
    );
  }
}
