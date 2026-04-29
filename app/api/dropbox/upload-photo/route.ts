// // app/api/dropbox/upload-photo/route.ts

// /**
//  * ─────────────────────────────────────────────
//  * DROPBOX PHOTO UPLOAD API
//  * ─────────────────────────────────────────────
//  *
//  * PURPOSE:
//  * Handles uploading a single photo file to Dropbox.
//  *
//  * USED BY:
//  * - Camera capture uploads
//  * - Gallery uploads (NEW FEATURE)
//  * - Retry queue (IndexedDB)
//  *
//  * EXPECTED FORM DATA:
//  * - photo       → File (required)
//  * - folderPath  → string (required)
//  * - fileName    → string (optional, but recommended)
//  *
//  * SECURITY:
//  * - Requires authenticated session
//  * - Validates Dropbox path is inside allowed root
//  *
//  * OUTPUT:
//  * - dropboxPath (final uploaded location)
//  * - upload metadata from Dropbox
//  *
//  * ─────────────────────────────────────────────
//  */

// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/libs/authOption";

// // Dropbox helpers (already implemented in your system)
// import {
//   cleanSegment,          // sanitizes file/folder names
//   dropboxContentUpload,  // actual upload function
//   isInsideRoot,          // prevents path escape (security)
//   joinDropboxPath,       // safely joins paths
// } from "@/app/libs/dropbox";

// export const runtime = "nodejs";

// /**
//  * ─────────────────────────────────────────────
//  * POST → Upload Photo
//  * ─────────────────────────────────────────────
//  */
// export async function POST(request: Request) {
//   // ───── AUTH GUARD ─────
//   const session = await getServerSession(authOptions);

//   if (!session) {
//     return NextResponse.json(
//       { message: "Unauthorized", status: 401 },
//       { status: 401 }
//     );
//   }

//   try {
//     // ───── PARSE FORM DATA ─────
//     const formData = await request.formData();

//     const file = formData.get("photo") as File | null;
//     const folderPath = formData.get("folderPath")?.toString();
//     const originalFileName = formData.get("fileName")?.toString();

//     // ───── VALIDATION ─────
//     if (!file) {
//       return NextResponse.json(
//         { message: "Photo file is required", status: 400 },
//         { status: 400 }
//       );
//     }

//     if (!folderPath) {
//       return NextResponse.json(
//         { message: "Folder path is required", status: 400 },
//         { status: 400 }
//       );
//     }

//     // SECURITY: Prevent path traversal outside root
//     if (!isInsideRoot(folderPath)) {
//       return NextResponse.json(
//         { message: "Invalid Dropbox folder path", status: 400 },
//         { status: 400 }
//       );
//     }

//     // ───── SAFE FILE NAME HANDLING ─────
//     // Uses provided name OR fallback
//     const safeFileName =
//       cleanSegment(originalFileName || `photo-${Date.now()}.jpg`) ||
//       `photo-${Date.now()}.jpg`;

//     // ───── FINAL DROPBOX PATH ─────
//     const dropboxPath = joinDropboxPath(folderPath, safeFileName);

//     // ───── FILE CONVERSION (Browser → Node Buffer) ─────
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // ───── UPLOAD TO DROPBOX ─────
//     const uploaded = await dropboxContentUpload(dropboxPath, buffer);

//     // ───── SUCCESS RESPONSE ─────
//     return NextResponse.json({
//       message: "Upload successful",
//       dropboxPath,
//       fileName: safeFileName,
//       uploaded,
//       status: 200,
//     });

//   } catch (error) {
//     console.error("UPLOAD ERROR:", error);

//     return NextResponse.json(
//       {
//         message: (error as Error).message || "Upload failed",
//         status: 500,
//       },
//       { status: 500 }
//     );
//   }
// }

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

const isAdminRole = (role?: string | null) =>
  ["admin", "superadmin", "super-admin", "owner"].includes(
    String(role || "").toLowerCase(),
  );

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
