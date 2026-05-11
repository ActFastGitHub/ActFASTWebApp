// app/api/dropbox/upload-photo/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import {
  cleanSegment,
  dropboxContentUpload,
  getDropboxRootPath,
  isInsideRoot,
  joinDropboxPath,
} from "@/app/libs/dropbox";
import { isAdminRole } from "@/app/libs/roles";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";

export const runtime = "nodejs";

const PROJECT_FOLDER_REGEX = /^\d{4}-\d{3,4}-\d{2}-[A-Za-z0-9-]+$/;
const NO_CLAIMS_FOLDER_REGEX = /^\d{4}-NO CLAIMS$/i;
const PICTURES_FOLDER_NAME = "1-PICTURES";
const CONTENTS_WET_PICS_FOLDER_NAME = "0-CONTENTS-WET-PICS";
const NR_CONTENT_PHOTOS_FOLDER_NAME = "2 NR CONTENT PHOTOS";
const PHOTO_NAME_REGEX =
  /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}__[a-z0-9-_]+__(camera|gallery)\.(jpg|jpeg|webp|png)$/i;

const normalizePath = (path: string) => path.replace(/\/+$/g, "").toLowerCase();

const cleanFileNamePart = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "") || "unknown";

const isAllowedProjectFolderName = (folderName: string) =>
  PROJECT_FOLDER_REGEX.test(folderName) ||
  NO_CLAIMS_FOLDER_REGEX.test(folderName);

const getRelativePathFromRoot = (path: string) => {
  const rootPath = getDropboxRootPath();
  const normalizedRoot = normalizePath(rootPath);
  const normalizedPath = normalizePath(path);

  if (normalizedPath === normalizedRoot) return "";
  if (!normalizedPath.startsWith(`${normalizedRoot}/`)) return "";

  return path.slice(rootPath.length).replace(/^\/+/, "");
};

const getProjectNameFromPath = (path: string) => {
  const relativePath = getRelativePathFromRoot(path);
  return relativePath.split("/").filter(Boolean)[0] || "";
};

const isNonAdminAllowedPhotoPath = (folderPath: string) => {
  const rootPath = getDropboxRootPath();
  const projectName = getProjectNameFromPath(folderPath);

  if (!isAllowedProjectFolderName(projectName)) return false;

  const picturesPath = joinDropboxPath(
    rootPath,
    projectName,
    PICTURES_FOLDER_NAME,
  );
  const nrContentPhotosPath = joinDropboxPath(
    rootPath,
    projectName,
    CONTENTS_WET_PICS_FOLDER_NAME,
    NR_CONTENT_PHOTOS_FOLDER_NAME,
  );

  const normalizedFolderPath = normalizePath(folderPath);

  return (
    normalizedFolderPath === normalizePath(picturesPath) ||
    normalizedFolderPath.startsWith(`${normalizePath(picturesPath)}/`) ||
    normalizedFolderPath === normalizePath(nrContentPhotosPath) ||
    normalizedFolderPath.startsWith(`${normalizePath(nrContentPhotosPath)}/`)
  );
};

const getFileExtension = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && extension.length <= 5 ? extension : "jpg";
};

const getTimestamp = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const sec = String(now.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}_${hh}-${min}-${sec}`;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Unauthorized", status: 401 },
      { status: 401 },
    );
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { role: true, nickname: true, firstName: true },
    });

    const isAdmin = isAdminRole(profile?.role);
    const uploaderName = cleanFileNamePart(
      profile?.nickname ||
        profile?.firstName ||
        session.user.name ||
        session.user.email,
    );

    const formData = await request.formData();
    const file = formData.get("photo") as File | null;
    const folderPath = formData.get("folderPath")?.toString();
    const originalFileName = formData.get("fileName")?.toString();
    const source = cleanFileNamePart(
      formData.get("source")?.toString() || "camera",
    );

    if (!file) {
      return NextResponse.json(
        { message: "Photo file is required", status: 400 },
        { status: 400 },
      );
    }

    if (!folderPath) {
      return NextResponse.json(
        { message: "Folder path is required", status: 400 },
        { status: 400 },
      );
    }

    if (!isInsideRoot(folderPath)) {
      return NextResponse.json(
        { message: "Invalid Dropbox folder path", status: 400 },
        { status: 400 },
      );
    }

    if (!isAdmin && !isNonAdminAllowedPhotoPath(folderPath)) {
      return NextResponse.json(
        {
          message: "You do not have permission to upload photos to this folder",
          status: 403,
        },
        { status: 403 },
      );
    }

    const safeSource = source === "gallery" ? "gallery" : "camera";
    const safeOriginalFileName = cleanSegment(originalFileName || "");
    const extension = getFileExtension(
      safeOriginalFileName || file.name || "photo.jpg",
    );

    let safeFileName = cleanSegment(
      safeOriginalFileName ||
        `${getTimestamp()}__${uploaderName}__${safeSource}.${extension}`,
    );

    if (!PHOTO_NAME_REGEX.test(safeFileName)) {
      safeFileName = `${getTimestamp()}__${uploaderName}__${safeSource}.${extension}`;
    }

    const dropboxPath = joinDropboxPath(folderPath, safeFileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploaded = await dropboxContentUpload(dropboxPath, buffer);

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "CREATE",
      entity: "DropboxPhoto",
      entityId: dropboxPath,
      projectCode: getProjectNameFromPath(folderPath) || null,
      summary: `Uploaded Dropbox photo: ${safeFileName}`,
      changes: {
        folderPath,
        dropboxPath,
        fileName: safeFileName,
        uploader: uploaderName,
        source: safeSource,
        originalFileName: originalFileName || null,
        fileSize: file.size,
        fileType: file.type,
        uploadedMetadata: uploaded,
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      message: "Upload successful",
      dropboxPath,
      fileName: safeFileName,
      uploader: uploaderName,
      source: safeSource,
      uploaded,
      status: 200,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        message: (error as Error).message || "Upload failed",
        status: 500,
      },
      { status: 500 },
    );
  }
}
