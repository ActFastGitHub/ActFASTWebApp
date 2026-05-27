// app/api/super-admin/backups/export/route.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import { canRunBackups } from "@/app/libs/roles";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";
import {
  APP_BACKUP_VERSION,
  APP_SCHEMA_VERSION,
  backupRegistry,
  getDefaultBackupCollectionKeys,
} from "@/app/libs/backupRegistry";

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
    const { searchParams } = new URL(request.url);

    const requestedCollections = searchParams
      .getAll("collections")
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);

    const selectedCollections =
      requestedCollections.length > 0
        ? requestedCollections
        : getDefaultBackupCollectionKeys();

    const registryItems = backupRegistry.filter((item) =>
      selectedCollections.includes(item.key),
    );

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

    const collections: Record<string, unknown[]> = {};
    const collectionCounts: Record<string, number> = {};

    for (const item of registryItems) {
      const records = await item.delegate.findMany();
      collections[item.key] = records;
      collectionCounts[item.key] = records.length;
    }

    const recordCount = Object.values(collectionCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    const backupData = {
      backupVersion: APP_BACKUP_VERSION,
      schemaVersion: APP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      exportedBy: {
        email: session.user.email,
        nickname: profile?.nickname || profile?.firstName || null,
        role: profile?.role || null,
      },
      warning:
        "This is an app-level JSON export, not a full MongoDB binary restore backup. Dropbox files and MongoDB Atlas snapshots remain separate.",
      collectionCounts,
      collections,
    };

    const json = JSON.stringify(backupData, null, 2);
    const fileName = `actfast-app-backup-v2-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

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
        backupVersion: APP_BACKUP_VERSION,
        schemaVersion: APP_SCHEMA_VERSION,
        collectionCounts,
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
