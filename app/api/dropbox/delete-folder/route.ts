// app\api\dropbox\delete-folder\route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import {
  dropboxApiFetch,
  getDropboxRootPath,
  isInsideRoot,
} from "@/app/libs/dropbox";
import { isSuperAdminRole } from "@/app/libs/roles";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";

export const runtime = "nodejs";

const TEMPLATE_FOLDER_NAME = "FOLDER STRUCTURE";
const PROJECT_FOLDER_REGEX = /^\d{4}-\d{3,4}-\d{2}-[A-Za-z0-9-]+$/;

type DropboxMetadata = {
  ".tag": string;
  name: string;
  path_display: string;
  path_lower: string;
};

function jsonError(message: string, status: number, detail?: string) {
  return NextResponse.json({ message, detail, status }, { status });
}

function normalizePath(path: string) {
  return path.replace(/\/+$/g, "").toLowerCase();
}

function getParentPath(path: string) {
  return path.split("/").slice(0, -1).join("/") || "/";
}

function getNameFromPath(path: string) {
  return path.split("/").filter(Boolean).pop() || "";
}

function isDirectProjectFolder(path: string) {
  const rootPath = getDropboxRootPath();
  const parentPath = getParentPath(path);

  return (
    normalizePath(parentPath) === normalizePath(rootPath) &&
    PROJECT_FOLDER_REGEX.test(getNameFromPath(path))
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { role: true, nickname: true, firstName: true },
    });

    if (!isSuperAdminRole(profile?.role)) {
      return jsonError("Super Admin access required", 403);
    }

    const body = await request.json().catch(() => ({}));
    const folderPath = String(body.path || "").trim();
    const confirmText = String(body.confirmText || "").trim();

    if (!folderPath) return jsonError("Folder path is required", 400);

    const rootPath = getDropboxRootPath();

    if (!isInsideRoot(folderPath)) {
      return jsonError("Invalid Dropbox path", 400);
    }

    if (normalizePath(folderPath) === normalizePath(rootPath)) {
      return jsonError("Root Dropbox folder cannot be deleted", 403);
    }

    const folderName = getNameFromPath(folderPath);

    if (folderName === TEMPLATE_FOLDER_NAME) {
      return jsonError("Template folder cannot be deleted", 403);
    }

    if (confirmText !== "DELETE") {
      return jsonError("Type DELETE to confirm folder deletion", 400);
    }

    const isProjectFolder = isDirectProjectFolder(folderPath);

    const deleted = await dropboxApiFetch<{ metadata: DropboxMetadata }>(
      "/files/delete_v2",
      {
        path: folderPath,
      },
    );

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "DELETE",
      entity: isProjectFolder ? "DropboxProjectFolder" : "DropboxFolder",
      entityId: folderPath,
      projectCode: isProjectFolder ? folderName.toUpperCase() : null,
      summary: `Deleted Dropbox folder: ${folderName}`,
      changes: {
        folderPath,
        folderName,
        isProjectFolder,
        note: "Dropbox folder was deleted. Project database record was intentionally not deleted.",
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      status: 200,
      message: "Folder deleted successfully",
      deleted,
      projectDatabaseDeleted: false,
    });
  } catch (error) {
    return jsonError(
      "Failed to delete folder",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
