// app/api/super-admin/backups/restore/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import { canRunBackups } from "@/app/libs/roles";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";
import {
  APP_BACKUP_VERSION,
  BackupCollectionKey,
  RestoreMode,
  getBackupRegistryItem,
  getRestorePlanOrder,
  sanitizeBackupRecord,
} from "@/app/libs/backupRegistry";

export const runtime = "nodejs";

function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function jsonError(message: string, status: number, detail?: string) {
  return jsonResponse({ message, detail, status }, status);
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

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function safeRestoreMode(value: unknown): RestoreMode {
  const mode = String(value || "")
    .trim()
    .toUpperCase();

  if (mode === "UPSERT") return "UPSERT";
  if (mode === "REPLACE_SELECTED") return "REPLACE_SELECTED";

  return "INSERT_MISSING";
}

function validateBackupShape(backupData: any) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isPlainObject(backupData)) {
    errors.push("Backup file must be a JSON object.");
    return { errors, warnings };
  }

  if (!backupData.collections || !isPlainObject(backupData.collections)) {
    errors.push("Backup file is missing the collections object.");
  }

  if (!backupData.backupVersion) {
    warnings.push(
      "Backup has no backupVersion. Restore will still try to read collections.",
    );
  }

  if (
    backupData.backupVersion &&
    backupData.backupVersion !== APP_BACKUP_VERSION
  ) {
    warnings.push(
      `Backup version is ${backupData.backupVersion}. Current restore version is ${APP_BACKUP_VERSION}.`,
    );
  }

  return { errors, warnings };
}

async function previewCollection(collectionKey: string, records: any[]) {
  try {
    const registryItem = getBackupRegistryItem(collectionKey);

    if (!registryItem) {
      return {
        collectionKey,
        supported: false,
        incoming: records.length,
        existing: 0,
        missing: records.length,
        errors: [`Unsupported collection: ${collectionKey}`],
      };
    }

    const ids = records
      .map((record) => String(record?.id || "").trim())
      .filter(Boolean);

    const existingRecords =
      ids.length > 0
        ? await registryItem.delegate.findMany({
            where: { id: { in: ids } },
            select: { id: true },
          })
        : [];

    const existingIds = new Set(
      existingRecords.map((record: any) => record.id),
    );

    return {
      collectionKey,
      label: registryItem.label,
      supported: true,
      incoming: records.length,
      existing: existingIds.size,
      missing: ids.filter((id) => !existingIds.has(id)).length,
      errors: [],
    };
  } catch (error) {
    return {
      collectionKey,
      supported: false,
      incoming: records.length,
      existing: 0,
      missing: records.length,
      errors: [
        error instanceof Error
          ? `Preview failed: ${error.message}`
          : "Preview failed: Unknown error",
      ],
    };
  }
}

async function restoreCollection(params: {
  collectionKey: BackupCollectionKey;
  records: any[];
  mode: RestoreMode;
}) {
  const registryItem = getBackupRegistryItem(params.collectionKey);

  if (!registryItem) {
    return {
      collectionKey: params.collectionKey,
      created: 0,
      updated: 0,
      skipped: 0,
      deletedBeforeRestore: 0,
      errors: [`Unsupported collection: ${params.collectionKey}`],
    };
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let deletedBeforeRestore = 0;
  const errors: string[] = [];

  if (params.mode === "REPLACE_SELECTED") {
    const deleted = await registryItem.delegate.deleteMany({});
    deletedBeforeRestore = deleted.count || 0;
  }

  for (const rawRecord of params.records) {
    try {
      if (!rawRecord?.id) {
        skipped += 1;
        errors.push(`Skipped record without id in ${params.collectionKey}.`);
        continue;
      }

      const data = sanitizeBackupRecord(rawRecord, registryItem.dateFields);

      const existing = await registryItem.delegate.findUnique({
        where: { id: data.id },
      });

      if (params.mode === "INSERT_MISSING" && existing) {
        skipped += 1;
        continue;
      }

      if (params.mode === "UPSERT") {
        await registryItem.delegate.upsert({
          where: { id: data.id },
          create: data,
          update: data,
        });

        if (existing) updated += 1;
        else created += 1;

        continue;
      }

      await registryItem.delegate.create({ data });
      created += 1;
    } catch (error) {
      errors.push(
        error instanceof Error
          ? `${params.collectionKey}: ${error.message}`
          : `${params.collectionKey}: Unknown restore error`,
      );
    }
  }

  return {
    collectionKey: params.collectionKey,
    label: registryItem.label,
    created,
    updated,
    skipped,
    deletedBeforeRestore,
    errors,
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return jsonError("Unauthorized", 401);
    }

    const profile = await getCurrentProfile(session.user.email);

    if (!canRunBackups(profile?.role)) {
      return jsonError("Super Admin access required", 403);
    }

    const body = await request.json().catch(() => null);

    if (!body) {
      return jsonError("Invalid JSON request body", 400);
    }

    const backupData = body.backupData;
    const dryRun = body.dryRun !== false;
    const mode = safeRestoreMode(body.mode);

    const selectedCollections = Array.isArray(body.selectedCollections)
      ? body.selectedCollections
          .map((item: unknown) => String(item).trim())
          .filter(Boolean)
      : [];

    const confirmText = String(body.confirmText || "").trim();

    const validation = validateBackupShape(backupData);

    if (validation.errors.length > 0) {
      return jsonResponse(
        {
          status: 400,
          valid: false,
          dryRun,
          errors: validation.errors,
          warnings: validation.warnings,
        },
        400,
      );
    }

    const collections = backupData.collections as Record<string, any[]>;

    const availableCollections = Object.keys(collections).filter((key) =>
      Array.isArray(collections[key]),
    );

    const collectionsToProcess =
      selectedCollections.length > 0
        ? selectedCollections.filter((key: string) =>
            availableCollections.includes(key),
          )
        : availableCollections;

    if (collectionsToProcess.length === 0) {
      return jsonError("No valid collections selected for restore", 400);
    }

    if (!dryRun && mode === "REPLACE_SELECTED" && confirmText !== "RESTORE") {
      return jsonError(
        "Confirmation required",
        400,
        "Type RESTORE before using REPLACE_SELECTED mode.",
      );
    }

    const preview = [];

    for (const collectionKey of collectionsToProcess) {
      preview.push(
        await previewCollection(
          collectionKey,
          collections[collectionKey] || [],
        ),
      );
    }

    if (dryRun) {
      return jsonResponse({
        status: 200,
        valid: true,
        dryRun: true,
        mode,
        backupVersion: backupData.backupVersion || null,
        schemaVersion: backupData.schemaVersion || null,
        exportedAt: backupData.exportedAt || null,
        exportedBy: backupData.exportedBy || null,
        warnings: validation.warnings,
        availableCollections,
        selectedCollections: collectionsToProcess,
        preview,
      });
    }

    const restoreOrder = getRestorePlanOrder(collectionsToProcess);
    const results = [];

    for (const registryItem of restoreOrder) {
      results.push(
        await restoreCollection({
          collectionKey: registryItem.key,
          records: collections[registryItem.key] || [],
          mode,
        }),
      );
    }

    const totalCreated = results.reduce((sum, item) => sum + item.created, 0);
    const totalUpdated = results.reduce((sum, item) => sum + item.updated, 0);
    const totalSkipped = results.reduce((sum, item) => sum + item.skipped, 0);
    const totalDeletedBeforeRestore = results.reduce(
      (sum, item) => sum + item.deletedBeforeRestore,
      0,
    );
    const totalErrors = results.reduce(
      (sum, item) => sum + item.errors.length,
      0,
    );

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "RESTORE",
      entity: "BackupRestore",
      summary: `Restored backup using ${mode}: ${totalCreated} created, ${totalUpdated} updated, ${totalSkipped} skipped`,
      changes: {
        mode,
        selectedCollections: collectionsToProcess,
        totalCreated,
        totalUpdated,
        totalSkipped,
        totalDeletedBeforeRestore,
        totalErrors,
        backupVersion: backupData.backupVersion || null,
        schemaVersion: backupData.schemaVersion || null,
        exportedAt: backupData.exportedAt || null,
      },
      ...getRequestAuditMeta(request),
    });

    return jsonResponse({
      status: 200,
      dryRun: false,
      mode,
      summary: {
        totalCreated,
        totalUpdated,
        totalSkipped,
        totalDeletedBeforeRestore,
        totalErrors,
      },
      results,
    });
  } catch (error) {
    console.error("RESTORE API ERROR:", error);

    return jsonError(
      "Restore failed",
      500,
      error instanceof Error ? error.message : "Unknown restore error",
    );
  }
}
