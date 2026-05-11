// app/api/dropbox/delete-photo/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import { dropboxApiFetch, isInsideRoot } from "@/app/libs/dropbox";
import { isAdminRole } from "@/app/libs/roles";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";

export const runtime = "nodejs";

const PHOTO_OWNER_REGEX =
  /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}__([a-z0-9-_]+)__(camera|gallery)\.(jpg|jpeg|webp|png)$/i;

const cleanFileNamePart = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "") || "unknown";

const getFileNameFromPath = (path: string) =>
  path.split("/").filter(Boolean).pop() || "";

const getProjectCodeFromDropboxPath = (path: string) => {
  const parts = path.split("/").filter(Boolean);
  return (
    parts.find((part) => /^\d{4}-\d{3,4}-\d{2}-[A-Za-z0-9-]+$/.test(part)) ||
    null
  );
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
    const dropboxPath = String(body?.dropboxPath || "").trim();

    if (!dropboxPath) {
      return NextResponse.json(
        { message: "Dropbox photo path is required", status: 400 },
        { status: 400 },
      );
    }

    if (!isInsideRoot(dropboxPath)) {
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

    const fileName = getFileNameFromPath(dropboxPath);
    const ownerMatch = fileName.match(PHOTO_OWNER_REGEX);
    const photoOwner = cleanFileNamePart(ownerMatch?.[1] || "");

    if (!isAdmin && (!photoOwner || photoOwner !== currentUserName)) {
      return NextResponse.json(
        {
          message: "You can only delete photos that you uploaded",
          status: 403,
        },
        { status: 403 },
      );
    }

    const deleted = await dropboxApiFetch("/files/delete_v2", {
      path: dropboxPath,
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile?.nickname || profile?.firstName || null,
      actorRole: profile?.role || null,
      action: "DELETE",
      entity: "DropboxPhoto",
      entityId: dropboxPath,
      projectCode: getProjectCodeFromDropboxPath(dropboxPath),
      summary: `Deleted Dropbox photo: ${fileName}`,
      changes: {
        deletedPath: dropboxPath,
        fileName,
        photoOwner: photoOwner || null,
        deletedMetadata: deleted,
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      message: "Photo deleted",
      deleted,
      status: 200,
    });
  } catch (error) {
    console.error("DELETE DROPBOX PHOTO ERROR:", error);

    return NextResponse.json(
      {
        message: (error as Error).message || "Failed to delete photo",
        status: 500,
      },
      { status: 500 },
    );
  }
}
