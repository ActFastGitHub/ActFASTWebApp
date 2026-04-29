// app/api/dropbox/list-files/route.ts

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
const PHOTO_OWNER_REGEX =
  /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}__([a-z0-9-_]+)__(camera|gallery)\.(jpg|jpeg|webp|png)$/i;
const IMAGE_FILE_REGEX = /\.(jpg|jpeg|png|webp|gif|heic|heif)$/i;

type DropboxEntry = {
  ".tag": string;
  name: string;
  path_display: string;
  path_lower: string;
  client_modified?: string;
  server_modified?: string;
  size?: number;
};

type DropboxListResponse = {
  entries: DropboxEntry[];
  cursor: string;
  has_more: boolean;
};

type TemporaryLinkResponse = {
  metadata: DropboxEntry;
  link: string;
};

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

const getPhotoOwnerFromFileName = (fileName: string) => {
  const match = fileName.match(PHOTO_OWNER_REGEX);
  return cleanFileNamePart(match?.[1] || "");
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
    const folderPath = String(body?.path || getDropboxRootPath()).trim();

    if (!folderPath) {
      return NextResponse.json(
        { message: "Folder path is required", status: 400 },
        { status: 400 },
      );
    }

    if (!isInsideRoot(folderPath)) {
      return NextResponse.json(
        { message: "Invalid Dropbox path", status: 400 },
        { status: 400 },
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { role: true, nickname: true, firstName: true },
    });

    const isAdmin = isAdminRole(profile?.role);
    const currentUserName = cleanFileNamePart(
      profile?.nickname ||
        profile?.firstName ||
        session.user.name ||
        session.user.email,
    );

    if (!isAdmin && !isNonAdminAllowedPhotoPath(folderPath)) {
      return NextResponse.json(
        {
          message: "You do not have access to this photo folder",
          status: 403,
        },
        { status: 403 },
      );
    }

    let data = await dropboxApiFetch<DropboxListResponse>(
      "/files/list_folder",
      {
        path: folderPath,
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

    const imageEntries = allEntries
      .filter((entry) => entry[".tag"] === "file")
      .filter((entry) => IMAGE_FILE_REGEX.test(entry.name))
      .filter((entry) => {
        if (isAdmin) return true;
        return getPhotoOwnerFromFileName(entry.name) === currentUserName;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.server_modified || a.client_modified || 0,
        ).getTime();
        const dateB = new Date(
          b.server_modified || b.client_modified || 0,
        ).getTime();
        return dateB - dateA;
      });

    const files = await Promise.all(
      imageEntries.map(async (entry) => {
        let previewUrl = "";

        try {
          const temporaryLink = await dropboxApiFetch<TemporaryLinkResponse>(
            "/files/get_temporary_link",
            { path: entry.path_display },
          );
          previewUrl = temporaryLink.link;
        } catch {
          previewUrl = "";
        }

        const owner = getPhotoOwnerFromFileName(entry.name);

        return {
          name: entry.name,
          path: entry.path_display,
          previewUrl,
          size: entry.size || 0,
          modifiedAt: entry.server_modified || entry.client_modified || null,
          owner,
          source: entry.name.includes("__gallery.") ? "gallery" : "camera",
          canDelete: isAdmin || owner === currentUserName,
        };
      }),
    );

    return NextResponse.json({
      files,
      currentPath: folderPath,
      totalFiles: files.length,
      access: { isAdmin },
      status: 200,
    });
  } catch (error) {
    console.error("LIST DROPBOX FILES ERROR:", error);

    return NextResponse.json(
      {
        message: (error as Error).message || "Failed to list Dropbox files",
        status: 500,
      },
      { status: 500 },
    );
  }
}
