import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import {
  cleanSegment,
  dropboxContentUpload,
  isInsideRoot,
  joinDropboxPath,
} from "@/app/libs/dropbox";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized", status: 401 },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();

    const file = formData.get("photo") as File | null;
    const folderPath = formData.get("folderPath")?.toString();
    const originalFileName = formData.get("fileName")?.toString();

    if (!file || !folderPath) {
      return NextResponse.json(
        { message: "Photo and folder path are required", status: 400 },
        { status: 400 },
      );
    }

    if (!isInsideRoot(folderPath)) {
      return NextResponse.json(
        { message: "Invalid Dropbox folder path", status: 400 },
        { status: 400 },
      );
    }

    const safeFileName =
      cleanSegment(originalFileName || `photo-${Date.now()}.jpg`) ||
      `photo-${Date.now()}.jpg`;

    const dropboxPath = joinDropboxPath(folderPath, safeFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await dropboxContentUpload(dropboxPath, buffer);

    return NextResponse.json({
      uploaded,
      dropboxPath,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message, status: 500 },
      { status: 500 },
    );
  }
}