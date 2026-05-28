// app/api/dropbox/copy-folder/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import {
  dropboxApiFetch,
  getDropboxRootPath,
  isInsideRoot,
} from "@/app/libs/dropbox";
import { isAdminRole } from "@/app/libs/roles";
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

type DropboxCopyResponse = {
  metadata: DropboxMetadata;
};

type DropboxApiError = Error & {
  status?: number;
  error_summary?: string;
};

const joinDropboxPath = (...parts: string[]) => {
  const cleanedParts = parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);

  return cleanedParts.length ? `/${cleanedParts.join("/")}` : "";
};

const getDropboxErrorSummary = (error: unknown) => {
  const dropboxError = error as DropboxApiError;

  return (
    dropboxError?.error_summary ||
    dropboxError?.message ||
    "Dropbox request failed"
  );
};

const isDropboxPathNotFoundError = (error: unknown) => {
  const summary = getDropboxErrorSummary(error).toLowerCase();
  return summary.includes("path/not_found") || summary.includes("not_found");
};

const jsonError = (message: string, status: number, detail?: string) => {
  return NextResponse.json({ message, detail, status }, { status });
};

async function dropboxPathExists(path: string) {
  try {
    await dropboxApiFetch<DropboxMetadata>("/files/get_metadata", {
      path,
      include_deleted: false,
    });
    return true;
  } catch (error) {
    if (isDropboxPathNotFoundError(error)) return false;
    throw error;
  }
}

async function findProjectByNormalizedCode(normalizedCode: string) {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      code: true,
    },
  });

  return (
    projects.find(
      (project) => project.code.trim().toUpperCase() === normalizedCode,
    ) || null
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
      select: {
        role: true,
        nickname: true,
        firstName: true,
      },
    });

    if (!isAdminRole(profile?.role)) {
      return jsonError("Admin access required", 403);
    }

    const body = await request.json().catch(() => ({}));
    const rootPath = getDropboxRootPath();

    const destinationFolderName = String(
      body?.destinationFolderName || "",
    ).trim();

    if (!destinationFolderName) {
      return jsonError("Destination folder name is required", 400);
    }

    if (destinationFolderName.includes("/")) {
      return jsonError("Folder name must not contain slashes", 400);
    }

    if (!PROJECT_FOLDER_REGEX.test(destinationFolderName)) {
      return jsonError(
        "Invalid project folder name format",
        400,
        "Expected: YYYY-NUMBER-MM-NAME (e.g., 2026-1016-04-SMITH)",
      );
    }

    const normalizedProjectCode = destinationFolderName.toUpperCase();

    const sourcePath = joinDropboxPath(rootPath, TEMPLATE_FOLDER_NAME);
    const destinationPath = joinDropboxPath(rootPath, normalizedProjectCode);

    if (!isInsideRoot(sourcePath) || !isInsideRoot(destinationPath)) {
      return jsonError(
        "Invalid Dropbox path",
        400,
        `Source: ${sourcePath} | Destination: ${destinationPath}`,
      );
    }

    const templateExists = await dropboxPathExists(sourcePath);
    if (!templateExists) {
      return jsonError("Template folder does not exist", 404, sourcePath);
    }

    const destinationExists = await dropboxPathExists(destinationPath);
    if (destinationExists) {
      return jsonError(
        "Project folder already exists. Nothing was created.",
        409,
        destinationPath,
      );
    }

    const existingProject = await findProjectByNormalizedCode(
      normalizedProjectCode,
    );

    const data = await dropboxApiFetch<DropboxCopyResponse>("/files/copy_v2", {
      from_path: sourcePath,
      to_path: destinationPath,
      autorename: false,
      allow_ownership_transfer: false,
    });

    let project = existingProject;
    let projectDatabaseStatus: "CREATED" | "ALREADY_EXISTS" = "ALREADY_EXISTS";

    if (!project) {
      project = await prisma.project.create({
        data: {
          code: normalizedProjectCode,
          projectStatus: "Not Started",
        },
        select: {
          id: true,
          code: true,
        },
      });

      projectDatabaseStatus = "CREATED";

      await createAuditLog({
        actorEmail: session.user.email,
        actorNickname: profile?.nickname || profile?.firstName || null,
        actorRole: profile?.role || null,
        action: "CREATE",
        entity: "Project",
        entityId: project.id,
        projectCode: project.code,
        summary: `Created project record from Dropbox template creator: ${project.code}`,
        changes: project,
        ...getRequestAuditMeta(request),
      });
    }

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "CREATE",
      entity: "DropboxProjectFolder",
      entityId: data.metadata.path_display,
      projectCode: normalizedProjectCode,
      summary: `Created Dropbox project folder from template: ${normalizedProjectCode}`,
      changes: {
        sourcePath,
        destinationPath,
        destinationFolderName: normalizedProjectCode,
        dropboxFolderName: data.metadata.name,
        dropboxFolderPath: data.metadata.path_display,
        projectDatabaseStatus,
        projectId: project?.id || null,
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      message: "Project folder created successfully",
      folder: {
        name: data.metadata.name,
        path: data.metadata.path_display,
      },
      project: {
        id: project?.id || null,
        code: project?.code || normalizedProjectCode,
        databaseStatus: projectDatabaseStatus,
      },
      status: 200,
    });
  } catch (error) {
    return jsonError(
      "Failed to create project folder",
      500,
      getDropboxErrorSummary(error),
    );
  }
}
