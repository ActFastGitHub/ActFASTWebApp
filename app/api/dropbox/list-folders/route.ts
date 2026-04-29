// app/api/dropbox/list-folders/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import {
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

type DropboxEntry = {
  ".tag": string;
  name: string;
  path_display: string;
  path_lower: string;
};

type DropboxListResponse = {
  entries: DropboxEntry[];
  cursor: string;
  has_more: boolean;
};

type SessionProfile = {
  role: string | null;
};

const normalizePath = (path: string) => path.replace(/\/+$/g, "").toLowerCase();

const isAdminRole = (role?: string | null) =>
  ["admin", "superadmin", "super-admin", "owner"].includes(
    String(role || "").toLowerCase(),
  );

const isAllowedProjectFolderName = (folderName: string) =>
  PROJECT_FOLDER_REGEX.test(folderName) ||
  NO_CLAIMS_FOLDER_REGEX.test(folderName);

const getProfile = async (email: string): Promise<SessionProfile | null> => {
  return prisma.profile.findUnique({
    where: { userEmail: email },
    select: { role: true },
  });
};

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

const isNonAdminBrowsablePath = (path: string) => {
  const rootPath = getDropboxRootPath();
  const normalizedPath = normalizePath(path);
  const normalizedRoot = normalizePath(rootPath);

  if (normalizedPath === normalizedRoot) return true;

  const projectName = getProjectNameFromPath(path);
  if (!isAllowedProjectFolderName(projectName)) return false;

  const projectRoot = joinDropboxPath(rootPath, projectName);
  const picturesPath = joinDropboxPath(projectRoot, PICTURES_FOLDER_NAME);
  const contentsWetPicsPath = joinDropboxPath(
    projectRoot,
    CONTENTS_WET_PICS_FOLDER_NAME,
  );
  const nrContentPhotosPath = joinDropboxPath(
    contentsWetPicsPath,
    NR_CONTENT_PHOTOS_FOLDER_NAME,
  );

  const allowedBrowseRoots = [
    projectRoot,
    picturesPath,
    nrContentPhotosPath,
  ].map(normalizePath);

  return allowedBrowseRoots.some(
    (allowedPath) => normalizedPath === allowedPath,
  );
};

const isNonAdminVisibleChild = (parentPath: string, folderPath: string) => {
  const rootPath = getDropboxRootPath();
  const projectName = getProjectNameFromPath(parentPath || rootPath);

  if (!projectName)
    return isAllowedProjectFolderName(folderPath.split("/").pop() || "");
  if (!isAllowedProjectFolderName(projectName)) return false;

  const projectRoot = joinDropboxPath(rootPath, projectName);
  const picturesPath = joinDropboxPath(projectRoot, PICTURES_FOLDER_NAME);
  const contentsWetPicsPath = joinDropboxPath(
    projectRoot,
    CONTENTS_WET_PICS_FOLDER_NAME,
  );
  const nrContentPhotosPath = joinDropboxPath(
    contentsWetPicsPath,
    NR_CONTENT_PHOTOS_FOLDER_NAME,
  );

  const normalizedParent = normalizePath(parentPath);
  const normalizedFolder = normalizePath(folderPath);

  if (normalizedParent === normalizePath(rootPath)) {
    return isAllowedProjectFolderName(folderPath.split("/").pop() || "");
  }

  if (normalizedParent === normalizePath(projectRoot)) {
    // Non-admin users should not browse the parent 0-CONTENTS-WET-PICS folder.
    // They can only jump directly to 0-CONTENTS-WET-PICS/2 NR CONTENT PHOTOS.
    return normalizedFolder === normalizePath(picturesPath);
  }

  if (normalizedParent === normalizePath(contentsWetPicsPath)) {
    return false;
  }

  if (normalizedParent === normalizePath(picturesPath)) return true;
  if (normalizedParent === normalizePath(nrContentPhotosPath)) return true;

  return false;
};

const dropboxPathExists = async (path: string) => {
  try {
    await dropboxApiFetch<DropboxEntry>("/files/get_metadata", {
      path,
      include_deleted: false,
    });
    return true;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message.toLowerCase()
        : String(error).toLowerCase();
    if (message.includes("path/not_found") || message.includes("not_found"))
      return false;
    throw error;
  }
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
    const body = await request.json().catch(() => ({}));
    const profile = await getProfile(session.user.email);
    const isAdmin = isAdminRole(profile?.role);

    const rootPath = getDropboxRootPath();
    const requestedPath = body?.path || rootPath;

    if (!isInsideRoot(requestedPath)) {
      return NextResponse.json(
        { message: "Invalid Dropbox path", status: 400 },
        { status: 400 },
      );
    }

    if (!isAdmin && !isNonAdminBrowsablePath(requestedPath)) {
      return NextResponse.json(
        {
          message: "You do not have access to this Dropbox folder",
          status: 403,
        },
        { status: 403 },
      );
    }

    let data = await dropboxApiFetch<DropboxListResponse>(
      "/files/list_folder",
      {
        path: requestedPath,
        recursive: false,
        include_deleted: false,
        include_has_explicit_shared_members: false,
        include_mounted_folders: true,
        include_non_downloadable_files: true,
        limit: 2000,
      },
    );

    const allEntries: DropboxEntry[] = [...data.entries];

    while (data.has_more) {
      data = await dropboxApiFetch<DropboxListResponse>(
        "/files/list_folder/continue",
        { cursor: data.cursor },
      );
      allEntries.push(...data.entries);
    }

    const isRootLevel =
      normalizePath(requestedPath) === normalizePath(rootPath);

    let folders = allEntries
      .filter((entry) => entry[".tag"] === "folder")
      .map((entry) => ({ name: entry.name, path: entry.path_display }))
      .filter((folder) => {
        if (isAdmin) return true;
        return isNonAdminVisibleChild(requestedPath, folder.path);
      });

    // Non-admin shortcut: show the approved NR photo folder directly at project level.
    // This avoids exposing/browsing the parent 0-CONTENTS-WET-PICS folder.
    if (!isAdmin) {
      const requestedProjectName = getProjectNameFromPath(requestedPath);
      const requestedProjectRoot = requestedProjectName
        ? joinDropboxPath(rootPath, requestedProjectName)
        : "";

      if (
        requestedProjectRoot &&
        normalizePath(requestedPath) === normalizePath(requestedProjectRoot)
      ) {
        const directNrContentPhotosPath = joinDropboxPath(
          requestedProjectRoot,
          CONTENTS_WET_PICS_FOLDER_NAME,
          NR_CONTENT_PHOTOS_FOLDER_NAME,
        );

        const directFolderAlreadyShown = folders.some(
          (folder) =>
            normalizePath(folder.path) ===
            normalizePath(directNrContentPhotosPath),
        );

        if (
          !directFolderAlreadyShown &&
          (await dropboxPathExists(directNrContentPhotosPath))
        ) {
          folders.push({
            name: NR_CONTENT_PHOTOS_FOLDER_NAME,
            path: directNrContentPhotosPath,
          });
        }
      }
    }

    folders = folders.sort((a, b) => {
      if (isRootLevel) {
        return b.name.localeCompare(a.name, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    return NextResponse.json({
      folders,
      currentPath: requestedPath,
      totalFolders: folders.length,
      access: { isAdmin },
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message, status: 500 },
      { status: 500 },
    );
  }
}
