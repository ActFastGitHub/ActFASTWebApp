// app/api/project-updates/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import {
  cleanSegment,
  dropboxApiFetch,
  dropboxContentUpload,
  isInsideRoot,
  joinDropboxPath,
} from "@/app/libs/dropbox";

export const runtime = "nodejs";

const PROJECT_UPDATES_FOLDER = "PROJECT UPDATES";
const PROJECT_LOG_FILE = "PROJECT-UPDATES-LOG.txt";
const TIME_ZONE = "America/Vancouver";

type DropboxCreateFolderResponse = {
  metadata: {
    name: string;
    path_display: string;
    path_lower: string;
  };
};

type DropboxCopyResponse = {
  metadata: {
    name: string;
    path_display: string;
    path_lower: string;
  };
};

type DropboxTemporaryLinkResponse = {
  metadata: {
    name: string;
    path_display: string;
    path_lower: string;
  };
  link: string;
};

type ProjectUpdateForLog = {
  id: string;
  projectCode: string;
  dropboxProjectPath: string;
  updates: string | null;
  leftToDo: string | null;
  photoNames: string[];
  photoPaths: string[];
  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null;
  submittedById: string | null;
  editedById: string | null;
};

const pad = (value: number) => String(value).padStart(2, "0");

function normalizeDropboxPath(path: string) {
  if (!path || typeof path !== "string") return "";

  return path
    .trim()
    .replace(/\\+/g, "/")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "");
}

function safeFileNamePart(value: string) {
  return (
    cleanSegment(value || "Unknown")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .slice(0, 40) || "unknown"
  );
}

function getExtension(fileNameOrPath: string, fallback = "jpg") {
  const match = fileNameOrPath.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() || fallback;
}

function getDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  const year = parts.year;
  const month = parts.month;
  const day = parts.day;
  const hour = parts.hour === "24" ? "00" : parts.hour;
  const minute = parts.minute;
  const second = parts.second;

  return {
    dateFolderName: `${year}-${month}-${day}`,
    timeForFileName: `${hour}${minute}${second}`,
    readableDateTime: formatReadableDateTime(date),
  };
}

function formatReadableDateTime(date: Date) {
  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: TIME_ZONE,
  });
}

function getDropboxErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error || "Dropbox request failed");
}

function isDropboxConflictError(error: unknown) {
  const message = getDropboxErrorMessage(error).toLowerCase();

  return (
    message.includes("path/conflict") ||
    message.includes("conflict") ||
    message.includes("already_exists") ||
    message.includes("folder")
  );
}

function isAdminRole(role?: string | null) {
  return ["admin", "superadmin", "super-admin", "owner"].includes(
    String(role || "").toLowerCase(),
  );
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

async function ensureDropboxFolder(path: string) {
  try {
    await dropboxApiFetch<DropboxCreateFolderResponse>(
      "/files/create_folder_v2",
      {
        path,
        autorename: false,
      },
    );
  } catch (error) {
    if (!isDropboxConflictError(error)) throw error;
  }
}

async function copyDropboxFile(fromPath: string, toPath: string) {
  const copied = await dropboxApiFetch<DropboxCopyResponse>("/files/copy_v2", {
    from_path: fromPath,
    to_path: toPath,
    autorename: true,
  });

  return copied.metadata.path_display || copied.metadata.path_lower || toPath;
}

async function getDropboxTextFile(path: string) {
  try {
    const temporaryLink = await dropboxApiFetch<DropboxTemporaryLinkResponse>(
      "/files/get_temporary_link",
      { path },
    );

    const response = await fetch(temporaryLink.link);
    if (!response.ok) return "";

    return await response.text();
  } catch {
    return "";
  }
}

async function overwriteDropboxTextFile(path: string, text: string) {
  /*
    Your existing dropboxContentUpload helper uses mode: "add", so it cannot truly
    overwrite a text log. To keep the existing helper untouched, this function first
    deletes the old log if it exists, then uploads the new version.
  */
  try {
    await dropboxApiFetch("/files/delete_v2", { path });
  } catch {
    // Ignore not_found. Upload below will create the file.
  }

  await dropboxContentUpload(path, Buffer.from(text, "utf8"));
}

function buildSingleLogEntry(params: {
  updateId: string;
  projectCode: string;
  projectPath: string;
  submittedBy: string;
  readableDateTime: string;
  updates: string;
  leftToDo: string;
  savedPhotoNames: string[];
  savedPhotoPaths: string[];
  editedBy?: string | null;
  editedAt?: Date | null;
}) {
  const photoList = params.savedPhotoNames.length
    ? params.savedPhotoNames.map((name) => `- ${name}`).join("\n")
    : "- No photos attached";

  const photoPathList = params.savedPhotoPaths.length
    ? params.savedPhotoPaths.map((path) => `- ${path}`).join("\n")
    : "- No photo paths recorded";

  const editedLines =
    params.editedAt || params.editedBy
      ? [
          `Edited By: ${params.editedBy || "Unknown"}`,
          `Edited At: ${
            params.editedAt
              ? formatReadableDateTime(params.editedAt)
              : "Unknown"
          }`,
        ]
      : [];

  return [
    "==================================================",
    `Update ID: ${params.updateId}`,
    `Date/Time: ${params.readableDateTime}`,
    `Submitted By: ${params.submittedBy}`,
    ...editedLines,
    `Project: ${params.projectCode}`,
    `Project Folder: ${params.projectPath}`,
    "",
    "Updates:",
    params.updates.trim() || "No update provided.",
    "",
    "Left to do:",
    params.leftToDo.trim() || "No left-to-do notes provided.",
    "",
    "Photos:",
    photoList,
    "",
    "Dropbox Photo Paths:",
    photoPathList,
    "==================================================",
    "",
  ].join("\n");
}

function buildProjectLog(
  projectCode: string,
  projectPath: string,
  updates: ProjectUpdateForLog[],
) {
  const header = [
    "ACTFAST PROJECT UPDATES LOG",
    `Project: ${projectCode}`,
    `Project Folder: ${projectPath}`,
    `Last Regenerated: ${formatReadableDateTime(new Date())}`,
    "",
  ].join("\n");

  const entries = updates
    .map((update) =>
      buildSingleLogEntry({
        updateId: update.id,
        projectCode: update.projectCode,
        projectPath: update.dropboxProjectPath,
        submittedBy: update.submittedById || "Unknown",
        readableDateTime: formatReadableDateTime(update.createdAt),
        updates: update.updates || "",
        leftToDo: update.leftToDo || "",
        savedPhotoNames: update.photoNames || [],
        savedPhotoPaths: update.photoPaths || [],
        editedBy: update.editedById,
        editedAt: update.editedAt,
      }),
    )
    .join("\n");

  return `${header}\n${entries || "No active project updates found.\n"}`;
}

async function rebuildDropboxProjectLog(projectCode: string) {
  const projectUpdates = await prisma.projectUpdate.findMany({
    where: {
      projectCode,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      projectCode: true,
      dropboxProjectPath: true,
      dropboxLogPath: true,
      updates: true,
      leftToDo: true,
      photoNames: true,
      photoPaths: true,
      submittedById: true,
      editedById: true,
      editedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const anchor = projectUpdates[0];

  if (!anchor?.dropboxLogPath || !anchor?.dropboxProjectPath) {
    return null;
  }

  const nextLog = buildProjectLog(
    projectCode,
    anchor.dropboxProjectPath,
    projectUpdates,
  );

  await overwriteDropboxTextFile(anchor.dropboxLogPath, nextLog);

  return {
    logPath: anchor.dropboxLogPath,
    count: projectUpdates.length,
  };
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Unauthorized", status: 401 },
      { status: 401 },
    );
  }

  try {
    const profile = await getCurrentProfile(session.user.email);
    const isAdmin = isAdminRole(profile?.role);

    const { searchParams } = new URL(request.url);
    const projectCode = String(searchParams.get("projectCode") || "").trim();
    const includeDeleted = searchParams.get("includeDeleted") === "1";

    const updates = await prisma.projectUpdate.findMany({
      where: {
        ...(projectCode ? { projectCode } : {}),
        ...(includeDeleted && isAdmin ? {} : { isDeleted: false }),
        ...(isAdmin ? {} : { submittedById: profile?.nickname || "__none__" }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    });

    return NextResponse.json({
      status: 200,
      access: { isAdmin },
      updates,
    });
  } catch (error) {
    console.error("Project update list error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to list project updates",
        status: 500,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Unauthorized", status: 401 },
      { status: 401 },
    );
  }

  let createdUpdateId: string | null = null;

  try {
    const formData = await request.formData();

    const projectCode = String(formData.get("projectCode") || "").trim();
    const rawProjectPath = String(formData.get("projectPath") || "").trim();
    const updates = String(formData.get("updates") || "").trim();
    const leftToDo = String(formData.get("leftToDo") || "").trim();

    let existingPhotoPaths: string[] = [];

    try {
      existingPhotoPaths = JSON.parse(
        String(formData.get("existingPhotoPaths") || "[]"),
      ) as string[];
    } catch {
      existingPhotoPaths = [];
    }

    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (!projectCode || !rawProjectPath) {
      return NextResponse.json(
        { message: "Project folder is required", status: 400 },
        { status: 400 },
      );
    }

    if (!updates && !leftToDo) {
      return NextResponse.json(
        {
          message: "Please enter an update or left-to-do note",
          status: 400,
        },
        { status: 400 },
      );
    }

    if (!files.length && !existingPhotoPaths.length) {
      return NextResponse.json(
        {
          message: "Please attach or select at least one photo",
          status: 400,
        },
        { status: 400 },
      );
    }

    const projectPath = normalizeDropboxPath(rawProjectPath);

    if (!isInsideRoot(projectPath)) {
      return NextResponse.json(
        { message: "Invalid Dropbox project path", status: 400 },
        { status: 400 },
      );
    }

    const profile = await getCurrentProfile(session.user.email);

    const submittedBy =
      profile?.nickname ||
      profile?.firstName ||
      session.user.name ||
      session.user.email;

    const safeSubmittedBy = safeFileNamePart(submittedBy);

    const project = await prisma.project.findUnique({
      where: { code: projectCode },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project does not exist in MongoDB", status: 404 },
        { status: 404 },
      );
    }

    const { dateFolderName, timeForFileName, readableDateTime } =
      getDateParts();

    const updatesFolderPath = joinDropboxPath(
      projectPath,
      PROJECT_UPDATES_FOLDER,
    );

    const dateFolderPath = joinDropboxPath(updatesFolderPath, dateFolderName);
    const logPath = joinDropboxPath(updatesFolderPath, PROJECT_LOG_FILE);

    const projectUpdate = await prisma.projectUpdate.create({
      data: {
        projectCode,
        dropboxProjectPath: projectPath,
        dropboxUpdatesPath: updatesFolderPath,
        dropboxDatePath: dateFolderPath,
        dropboxLogPath: logPath,
        updates,
        leftToDo,
        submittedById: profile?.nickname || null,
        photoNames: [],
        photoPaths: [],
        whatsappShareStatus: "PENDING",
      },
    });

    createdUpdateId = projectUpdate.id;

    await ensureDropboxFolder(updatesFolderPath);
    await ensureDropboxFolder(dateFolderPath);

    const savedPhotoNames: string[] = [];
    const savedPhotoPaths: string[] = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const extension = getExtension(file.name, "jpg");
      const fileNumber = pad(index + 1);

      const fileName = `${dateFolderName}_${timeForFileName}_${safeSubmittedBy}_new_${fileNumber}.${extension}`;
      const destinationPath = joinDropboxPath(dateFolderPath, fileName);

      await dropboxContentUpload(destinationPath, buffer);

      savedPhotoNames.push(fileName);
      savedPhotoPaths.push(destinationPath);
    }

    for (let index = 0; index < existingPhotoPaths.length; index++) {
      const sourcePath = normalizeDropboxPath(existingPhotoPaths[index]);

      if (!sourcePath || !isInsideRoot(sourcePath)) continue;

      const extension = getExtension(sourcePath, "jpg");
      const fileNumber = pad(index + 1);

      const fileName = `${dateFolderName}_${timeForFileName}_${safeSubmittedBy}_existing_${fileNumber}.${extension}`;
      const destinationPath = joinDropboxPath(dateFolderPath, fileName);

      const copiedPath = await copyDropboxFile(sourcePath, destinationPath);

      savedPhotoNames.push(fileName);
      savedPhotoPaths.push(copiedPath);
    }

    const savedUpdate = await prisma.projectUpdate.update({
      where: { id: projectUpdate.id },
      data: {
        photoNames: savedPhotoNames,
        photoPaths: savedPhotoPaths,
        dropboxSyncedAt: new Date(),
      },
    });

    const logEntry = buildSingleLogEntry({
      updateId: savedUpdate.id,
      projectCode,
      projectPath,
      submittedBy,
      readableDateTime,
      updates,
      leftToDo,
      savedPhotoNames,
      savedPhotoPaths,
    });

    await rebuildDropboxProjectLog(projectCode);

    return NextResponse.json({
      status: 200,
      message: "Project update saved",
      update: savedUpdate,
      updateId: savedUpdate.id,
      shareText: logEntry,
      savedPhotoNames,
      savedPhotoPaths,
      dateFolderPath,
      logPath,
    });
  } catch (error) {
    console.error("Project update save error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to save project update",
        status: 500,
        updateId: createdUpdateId,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Unauthorized", status: 401 },
      { status: 401 },
    );
  }

  try {
    const profile = await getCurrentProfile(session.user.email);
    const isAdmin = isAdminRole(profile?.role);

    const body = await request.json().catch(() => ({}));

    const updateId = String(body.updateId || "").trim();

    if (!updateId) {
      return NextResponse.json(
        { message: "Project update ID is required", status: 400 },
        { status: 400 },
      );
    }

    const existingUpdate = await prisma.projectUpdate.findUnique({
      where: { id: updateId },
    });

    if (!existingUpdate || existingUpdate.isDeleted) {
      return NextResponse.json(
        { message: "Project update not found", status: 404 },
        { status: 404 },
      );
    }

    if (!isAdmin && body.whatsappShareStatus === undefined) {
      return NextResponse.json(
        { message: "Admin access required", status: 403 },
        { status: 403 },
      );
    }

    if (!isAdmin && existingUpdate.submittedById !== profile?.nickname) {
      return NextResponse.json(
        { message: "You can only update your own share status", status: 403 },
        { status: 403 },
      );
    }

    const patchData: {
      whatsappShareStatus?: string;
      whatsappSharedAt?: Date | null;
      updates?: string;
      leftToDo?: string;
      editedById?: string | null;
      editedAt?: Date;
    } = {};

    if (body.whatsappShareStatus !== undefined) {
      const whatsappShareStatus = String(
        body.whatsappShareStatus || "ATTEMPTED",
      ).trim();

      const allowedStatuses = ["PENDING", "ATTEMPTED", "FAILED"];

      if (!allowedStatuses.includes(whatsappShareStatus)) {
        return NextResponse.json(
          { message: "Invalid WhatsApp share status", status: 400 },
          { status: 400 },
        );
      }

      patchData.whatsappShareStatus = whatsappShareStatus;
      patchData.whatsappSharedAt =
        whatsappShareStatus === "ATTEMPTED" ? new Date() : null;
    }

    if (isAdmin && body.updates !== undefined) {
      patchData.updates = String(body.updates || "").trim();
      patchData.editedById = profile?.nickname || null;
      patchData.editedAt = new Date();
    }

    if (isAdmin && body.leftToDo !== undefined) {
      patchData.leftToDo = String(body.leftToDo || "").trim();
      patchData.editedById = profile?.nickname || null;
      patchData.editedAt = new Date();
    }

    const updated = await prisma.projectUpdate.update({
      where: { id: updateId },
      data: patchData,
    });

    if (
      isAdmin &&
      (body.updates !== undefined || body.leftToDo !== undefined)
    ) {
      await rebuildDropboxProjectLog(existingUpdate.projectCode);
    }

    return NextResponse.json({
      status: 200,
      message: "Project update updated",
      update: updated,
    });
  } catch (error) {
    console.error("Project update patch error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to update project update",
        status: 500,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Unauthorized", status: 401 },
      { status: 401 },
    );
  }

  try {
    const profile = await getCurrentProfile(session.user.email);
    const isAdmin = isAdminRole(profile?.role);

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Admin access required", status: 403 },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const updateId = String(body.updateId || "").trim();

    if (!updateId) {
      return NextResponse.json(
        { message: "Project update ID is required", status: 400 },
        { status: 400 },
      );
    }

    const existingUpdate = await prisma.projectUpdate.findUnique({
      where: { id: updateId },
    });

    if (!existingUpdate || existingUpdate.isDeleted) {
      return NextResponse.json(
        { message: "Project update not found", status: 404 },
        { status: 404 },
      );
    }

    const deleted = await prisma.projectUpdate.update({
      where: { id: updateId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: profile?.nickname || null,
      },
    });

    await rebuildDropboxProjectLog(existingUpdate.projectCode);

    return NextResponse.json({
      status: 200,
      message: "Project update deleted",
      update: deleted,
    });
  } catch (error) {
    console.error("Project update delete error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete project update",
        status: 500,
      },
      { status: 500 },
    );
  }
}
