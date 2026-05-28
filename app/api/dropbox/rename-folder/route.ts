// app\api\dropbox\rename-folder\route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import {
  cleanSegment,
  dropboxApiFetch,
  getDropboxRootPath,
  isInsideRoot,
  joinDropboxPath,
} from "@/app/libs/dropbox";
import { isSuperAdminRole } from "@/app/libs/roles";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";

export const runtime = "nodejs";

const PROJECT_FOLDER_REGEX = /^\d{4}-\d{3,4}-\d{2}-[A-Za-z0-9-]+$/;
const TEMPLATE_FOLDER_NAME = "FOLDER STRUCTURE";

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

async function dropboxPathExists(path: string) {
  try {
    await dropboxApiFetch<DropboxMetadata>("/files/get_metadata", {
      path,
      include_deleted: false,
    });
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error);
    if (message.includes("not_found") || message.includes("path/not_found")) {
      return false;
    }
    throw error;
  }
}

async function findProjectByNormalizedCode(code: string) {
  const projects = await prisma.project.findMany({
    select: { id: true, code: true },
  });

  return (
    projects.find(
      (project) => project.code.trim().toUpperCase() === code.toUpperCase(),
    ) || null
  );
}

async function updateProjectCodeEverywhere(oldCode: string, newCode: string) {
  await Promise.all([
    prisma.project.updateMany({
      where: { code: oldCode },
      data: { code: newCode },
    }),
    prisma.material.updateMany({
      where: { projectCode: oldCode },
      data: { projectCode: newCode },
    }),
    prisma.subcontractor.updateMany({
      where: { projectCode: oldCode },
      data: { projectCode: newCode },
    }),
    prisma.laborCost.updateMany({
      where: { projectCode: oldCode },
      data: { projectCode: newCode },
    }),
    prisma.spreadsheetEntry.updateMany({
      where: { projectCode: oldCode },
      data: { projectCode: newCode },
    }),
    prisma.item.updateMany({
      where: { projectCode: oldCode },
      data: { projectCode: newCode },
    }),
    prisma.equipment.updateMany({
      where: { currentProjectCode: oldCode },
      data: { currentProjectCode: newCode },
    }),
    prisma.equipmentMovement.updateMany({
      where: { projectCode: oldCode },
      data: { projectCode: newCode },
    }),
    prisma.projectUpdate.updateMany({
      where: { projectCode: oldCode },
      data: { projectCode: newCode },
    }),
    prisma.finalRepairsAgreement.updateMany({
      where: { projectCode: oldCode },
      data: { projectCode: newCode },
    }),
    prisma.finalRepairMaterialSelection.updateMany({
      where: { projectCode: oldCode },
      data: { projectCode: newCode },
    }),
  ]);
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

    const fromPath = String(body.path || "").trim();
    const newFolderName = cleanSegment(String(body.newFolderName || "")).trim();

    if (!fromPath) return jsonError("Folder path is required", 400);
    if (!newFolderName) return jsonError("New folder name is required", 400);
    if (newFolderName.includes("/")) {
      return jsonError("Folder name must not contain slashes", 400);
    }

    if (!isInsideRoot(fromPath)) {
      return jsonError("Invalid Dropbox path", 400);
    }

    const oldFolderName = getNameFromPath(fromPath);

    if (oldFolderName === TEMPLATE_FOLDER_NAME) {
      return jsonError("Template folder cannot be renamed", 403);
    }

    const parentPath = getParentPath(fromPath);
    const toPath = joinDropboxPath(parentPath, newFolderName);

    if (!isInsideRoot(toPath)) {
      return jsonError("Invalid destination path", 400);
    }

    if (normalizePath(fromPath) === normalizePath(toPath)) {
      return jsonError("New folder name is the same as the current name", 400);
    }

    const sourceExists = await dropboxPathExists(fromPath);
    if (!sourceExists) return jsonError("Source folder does not exist", 404);

    const destinationExists = await dropboxPathExists(toPath);
    if (destinationExists) {
      return jsonError("A folder with that name already exists", 409);
    }

    const isProjectRename = isDirectProjectFolder(fromPath);

    if (isProjectRename && !PROJECT_FOLDER_REGEX.test(newFolderName)) {
      return jsonError(
        "Invalid project folder name format",
        400,
        "Expected: YYYY-NUMBER-MM-NAME",
      );
    }

    const oldProjectCode = oldFolderName.toUpperCase();
    const newProjectCode = newFolderName.toUpperCase();

    if (isProjectRename) {
      const existingOldProject =
        await findProjectByNormalizedCode(oldProjectCode);
      const existingNewProject =
        await findProjectByNormalizedCode(newProjectCode);

      if (
        existingNewProject &&
        existingOldProject &&
        existingNewProject.id !== existingOldProject.id
      ) {
        return jsonError("A project with the new code already exists", 409);
      }
    }

    const data = await dropboxApiFetch<{ metadata: DropboxMetadata }>(
      "/files/move_v2",
      {
        from_path: fromPath,
        to_path: toPath,
        autorename: false,
        allow_ownership_transfer: false,
      },
    );

    if (isProjectRename && oldProjectCode !== newProjectCode) {
      await updateProjectCodeEverywhere(oldProjectCode, newProjectCode);
    }

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "UPDATE",
      entity: isProjectRename ? "DropboxProjectFolder" : "DropboxFolder",
      entityId: data.metadata.path_display,
      projectCode: isProjectRename ? newProjectCode : null,
      summary: `Renamed Dropbox folder: ${oldFolderName} → ${newFolderName}`,
      changes: {
        fromPath,
        toPath,
        oldFolderName,
        newFolderName,
        isProjectRename,
        oldProjectCode: isProjectRename ? oldProjectCode : null,
        newProjectCode: isProjectRename ? newProjectCode : null,
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      status: 200,
      message: "Folder renamed successfully",
      folder: {
        name: data.metadata.name,
        path: data.metadata.path_display,
      },
      projectRename: isProjectRename
        ? {
            oldCode: oldProjectCode,
            newCode: newProjectCode,
          }
        : null,
    });
  } catch (error) {
    return jsonError(
      "Failed to rename folder",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}