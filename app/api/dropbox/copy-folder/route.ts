// app/api/dropbox/copy-folder/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import {
  dropboxApiFetch,
  getDropboxRootPath,
  isInsideRoot,
} from "@/app/libs/dropbox";

export const runtime = "nodejs";

const TEMPLATE_FOLDER_NAME = "FOLDER STRUCTURE";
const PROJECT_FOLDER_REGEX = /^\d{4}-\d{3,4}-\d{2}-[A-Za-z0-9-]+$/;

type DropboxMetadata = {
  ".tag": string;
  name: string;
  path_display: string;
  path_lower: string;
};

type DropboxCopyResponse = {
  metadata: DropboxMetadata;
};

type DropboxApiError = Error & {
  status?: number;
  error_summary?: string;
};

/* ─────────── Helpers ─────────── */

const joinDropboxPath = (...parts: string[]) => {
  const cleanedParts = parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);

  return cleanedParts.length ? `/${cleanedParts.join("/")}` : "";
};

const getDropboxErrorSummary = (error: unknown) => {
  const dropboxError = error as DropboxApiError;

  return (
    dropboxError?.error_summary ||
    dropboxError?.message ||
    "Dropbox request failed"
  );
};

const isDropboxPathNotFoundError = (error: unknown) => {
  const summary = getDropboxErrorSummary(error).toLowerCase();
  return summary.includes("path/not_found") || summary.includes("not_found");
};

const jsonError = (message: string, status: number, detail?: string) => {
  return NextResponse.json({ message, detail, status }, { status });
};

async function dropboxPathExists(path: string) {
  try {
    await dropboxApiFetch<DropboxMetadata>("/files/get_metadata", {
      path,
      include_deleted: false,
    });
    return true;
  } catch (error) {
    if (isDropboxPathNotFoundError(error)) return false;
    throw error;
  }
}

/* ─────────── API ─────────── */

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    /* 🔐 Admin check */
    const profile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { role: true },
    });

    if (String(profile?.role || "").toLowerCase() !== "admin") {
      return jsonError("Admin access required", 403);
    }

    const body = await request.json().catch(() => ({}));

    const rootPath = getDropboxRootPath();

    const destinationFolderName = String(
      body?.destinationFolderName || "",
    ).trim();

    if (!destinationFolderName) {
      return jsonError("Destination folder name is required", 400);
    }

    if (destinationFolderName.includes("/")) {
      return jsonError("Folder name must not contain slashes", 400);
    }

    if (!PROJECT_FOLDER_REGEX.test(destinationFolderName)) {
      return jsonError(
        "Invalid project folder name format",
        400,
        "Expected: YYYY-NUMBER-MM-NAME (e.g., 2026-1016-04-SMITH)",
      );
    }

    /* ✅ FORCE correct template path */
    const sourcePath = joinDropboxPath(rootPath, TEMPLATE_FOLDER_NAME);

    /* ✅ Destination */
    const destinationPath = joinDropboxPath(rootPath, destinationFolderName);

    /* 🛡️ Root safety */
    if (!isInsideRoot(sourcePath) || !isInsideRoot(destinationPath)) {
      return jsonError(
        "Invalid Dropbox path",
        400,
        `Source: ${sourcePath} | Destination: ${destinationPath}`,
      );
    }

    /* 🛡️ Ensure template exists */
    const templateExists = await dropboxPathExists(sourcePath);
    if (!templateExists) {
      return jsonError("Template folder does not exist", 404, sourcePath);
    }

    /* 🛡️ Prevent duplicates */
    const destinationExists = await dropboxPathExists(destinationPath);
    if (destinationExists) {
      return jsonError(
        "Project folder already exists. Nothing was created.",
        409,
        destinationPath,
      );
    }

    /* 📁 COPY */
    const data = await dropboxApiFetch<DropboxCopyResponse>("/files/copy_v2", {
      from_path: sourcePath,
      to_path: destinationPath,
      autorename: false, // ❌ prevent "(1)"
      allow_ownership_transfer: false,
    });

    return NextResponse.json({
      message: "Project folder created successfully",
      folder: {
        name: data.metadata.name,
        path: data.metadata.path_display,
      },
      status: 200,
    });
  } catch (error) {
    return jsonError(
      "Failed to create project folder",
      500,
      getDropboxErrorSummary(error),
    );
  }
}
