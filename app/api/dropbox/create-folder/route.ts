import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import {
  cleanSegment,
  dropboxApiFetch,
  getDropboxRootPath,
  isInsideRoot,
  joinDropboxPath,
} from "@/app/libs/dropbox";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized", detail: "No active session found.", status: 401 },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

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

    const data = await dropboxApiFetch<{
      metadata: {
        name: string;
        path_display: string;
      };
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
        detail: error instanceof Error ? error.message : String(error),
        status: 500,
      },
      { status: 500 },
    );
  }
}