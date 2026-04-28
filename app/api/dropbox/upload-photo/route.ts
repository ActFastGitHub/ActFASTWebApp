
// app/api/dropbox/upload-photo/route.ts

/**
 * ─────────────────────────────────────────────
 * DROPBOX PHOTO UPLOAD API
 * ─────────────────────────────────────────────
 *
 * PURPOSE:
 * Handles uploading a single photo file to Dropbox.
 *
 * USED BY:
 * - Camera capture uploads
 * - Gallery uploads (NEW FEATURE)
 * - Retry queue (IndexedDB)
 *
 * EXPECTED FORM DATA:
 * - photo       → File (required)
 * - folderPath  → string (required)
 * - fileName    → string (optional, but recommended)
 *
 * SECURITY:
 * - Requires authenticated session
 * - Validates Dropbox path is inside allowed root
 *
 * OUTPUT:
 * - dropboxPath (final uploaded location)
 * - upload metadata from Dropbox
 *
 * ─────────────────────────────────────────────
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

// Dropbox helpers (already implemented in your system)
import {
  cleanSegment,          // sanitizes file/folder names
  dropboxContentUpload,  // actual upload function
  isInsideRoot,          // prevents path escape (security)
  joinDropboxPath,       // safely joins paths
} from "@/app/libs/dropbox";

export const runtime = "nodejs";

/**
 * ─────────────────────────────────────────────
 * POST → Upload Photo
 * ─────────────────────────────────────────────
 */
export async function POST(request: Request) {
  // ───── AUTH GUARD ─────
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: "Unauthorized", status: 401 },
      { status: 401 }
    );
  }

  try {
    // ───── PARSE FORM DATA ─────
    const formData = await request.formData();

    const file = formData.get("photo") as File | null;
    const folderPath = formData.get("folderPath")?.toString();
    const originalFileName = formData.get("fileName")?.toString();

    // ───── VALIDATION ─────
    if (!file) {
      return NextResponse.json(
        { message: "Photo file is required", status: 400 },
        { status: 400 }
      );
    }

    if (!folderPath) {
      return NextResponse.json(
        { message: "Folder path is required", status: 400 },
        { status: 400 }
      );
    }

    // SECURITY: Prevent path traversal outside root
    if (!isInsideRoot(folderPath)) {
      return NextResponse.json(
        { message: "Invalid Dropbox folder path", status: 400 },
        { status: 400 }
      );
    }

    // ───── SAFE FILE NAME HANDLING ─────
    // Uses provided name OR fallback
    const safeFileName =
      cleanSegment(originalFileName || `photo-${Date.now()}.jpg`) ||
      `photo-${Date.now()}.jpg`;

    // ───── FINAL DROPBOX PATH ─────
    const dropboxPath = joinDropboxPath(folderPath, safeFileName);

    // ───── FILE CONVERSION (Browser → Node Buffer) ─────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ───── UPLOAD TO DROPBOX ─────
    const uploaded = await dropboxContentUpload(dropboxPath, buffer);

    // ───── SUCCESS RESPONSE ─────
    return NextResponse.json({
      message: "Upload successful",
      dropboxPath,
      fileName: safeFileName,
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
      { status: 500 }
    );
  }
}