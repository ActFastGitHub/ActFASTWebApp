// app/api/dropbox/create-folder/route.ts

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

export const runtime = "nodejs";

const PROJECT_FOLDER_REGEX = /^\d{4}-\d{3,4}-\d{2}-[A-Za-z0-9-]+$/;
const NO_CLAIMS_FOLDER_REGEX = /^\d{4}-NO CLAIMS$/i;
const PICTURES_FOLDER_NAME = "1-PICTURES";
const CONTENTS_WET_PICS_FOLDER_NAME = "0-CONTENTS-WET-PICS";
const NR_CONTENT_PHOTOS_FOLDER_NAME = "2 NR CONTENT PHOTOS";

const normalizePath = (path: string) => path.replace(/\/+$/g, "").toLowerCase();

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

const isNonAdminAllowedCreateParent = (parentPath: string) => {
  const rootPath = getDropboxRootPath();
  const projectName = getProjectNameFromPath(parentPath);

  if (!isAllowedProjectFolderName(projectName)) return false;

  const projectRoot = joinDropboxPath(rootPath, projectName);
  const picturesPath = joinDropboxPath(projectRoot, PICTURES_FOLDER_NAME);
  const nrContentPhotosPath = joinDropboxPath(
    projectRoot,
    CONTENTS_WET_PICS_FOLDER_NAME,
    NR_CONTENT_PHOTOS_FOLDER_NAME,
  );

  const normalizedParent = normalizePath(parentPath);

  return (
    normalizedParent === normalizePath(picturesPath) ||
    normalizedParent.startsWith(`${normalizePath(picturesPath)}/`) ||
    normalizedParent === normalizePath(nrContentPhotosPath) ||
    normalizedParent.startsWith(`${normalizePath(nrContentPhotosPath)}/`)
  );
};

const getDropboxErrorSummary = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      {
        message: "Unauthorized",
        detail: "No active session found.",
        status: 401,
      },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const profile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { role: true },
    });

    const isAdmin = isAdminRole(profile?.role);
    const parentPath = body?.parentPath || getDropboxRootPath();
    const folderName = cleanSegment(body?.folderName || "");

    if (!folderName) {
      return NextResponse.json(
        {
          message: "Folder name is required",
          detail: "The frontend did not send folderName.",
          receivedBody: body,
          status: 400,
        },
        { status: 400 },
      );
    }

    const newPath = joinDropboxPath(parentPath, folderName);

    if (!isInsideRoot(newPath)) {
      return NextResponse.json(
        {
          message: "Invalid Dropbox path",
          detail: "The folder path is outside DROPBOX_ROOT_PATH.",
          parentPath,
          newPath,
          rootPath: getDropboxRootPath(),
          status: 400,
        },
        { status: 400 },
      );
    }

    if (!isAdmin && !isNonAdminAllowedCreateParent(parentPath)) {
      return NextResponse.json(
        {
          message: "You do not have permission to create folders here",
          detail:
            "Non-admin users can only create folders inside 1-PICTURES or 0-CONTENTS-WET-PICS/2 NR CONTENT PHOTOS.",
          status: 403,
        },
        { status: 403 },
      );
    }

    const data = await dropboxApiFetch<{
      metadata: { name: string; path_display: string };
    }>("/files/create_folder_v2", {
      path: newPath,
      autorename: false,
    });

    return NextResponse.json({
      message: "Folder created",
      folder: {
        name: data.metadata.name,
        path: data.metadata.path_display,
      },
      status: 200,
    });
  } catch (error) {
    console.error("CREATE DROPBOX FOLDER ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to create Dropbox folder",
        detail: getDropboxErrorSummary(error),
        status: 500,
      },
      { status: 500 },
    );
  }
}
