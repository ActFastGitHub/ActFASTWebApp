// app/api/dropbox/list-folders/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import {
  dropboxApiFetch,
  getDropboxRootPath,
  isInsideRoot,
} from "@/app/libs/dropbox";

export const runtime = "nodejs";

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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized", status: 401 },
      { status: 401 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));

    const rootPath = getDropboxRootPath();
    const requestedPath = body?.path || rootPath;

    if (!isInsideRoot(requestedPath)) {
      return NextResponse.json(
        { message: "Invalid Dropbox path", status: 400 },
        { status: 400 },
      );
    }

    let data = await dropboxApiFetch<DropboxListResponse>("/files/list_folder", {
      path: requestedPath,
      recursive: false,
      include_deleted: false,
      include_has_explicit_shared_members: false,
      include_mounted_folders: true,
      include_non_downloadable_files: true,
      limit: 2000,
    });

    const allEntries: DropboxEntry[] = [...data.entries];

    while (data.has_more) {
      data = await dropboxApiFetch<DropboxListResponse>(
        "/files/list_folder/continue",
        {
          cursor: data.cursor,
        },
      );

      allEntries.push(...data.entries);
    }

    const isRootLevel =
      requestedPath.toLowerCase() === rootPath.toLowerCase();

    const folders = allEntries
      .filter((entry) => entry[".tag"] === "folder")
      .map((entry) => ({
        name: entry.name,
        path: entry.path_display,
      }))
      .sort((a, b) => {
        // Project folders = descending
        if (isRootLevel) {
          return b.name.localeCompare(a.name, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        }

        // Room/category folders = ascending
        return a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });

    return NextResponse.json({
      folders,
      currentPath: requestedPath,
      totalFolders: folders.length,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message, status: 500 },
      { status: 500 },
    );
  }
}