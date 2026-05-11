// app/api/projects/spreadsheet/route.tsx

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { canManageFinalRepairs } from "@/app/libs/roles";
import {
  buildChangeSet,
  createAuditLog,
  getRequestAuditMeta,
} from "@/app/libs/auditLog";

function jsonError(message: string, status: number, detail?: string) {
  return NextResponse.json({ message, detail, status }, { status });
}

async function getCurrentProfile(email: string) {
  return prisma.profile.findUnique({
    where: { userEmail: email },
    select: {
      nickname: true,
      firstName: true,
      role: true,
    },
  });
}

function cleanString(value: unknown) {
  return String(value || "").trim();
}

function isValidSpreadsheetData(data: any) {
  return data && Array.isArray(data.columns) && Array.isArray(data.rows);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectCode = cleanString(searchParams.get("projectCode"));

    if (!projectCode) {
      return jsonError("Missing projectCode", 400);
    }

    const entry = await prisma.spreadsheetEntry.findUnique({
      where: { projectCode },
      include: {
        lastUpdatedBy: {
          select: {
            firstName: true,
            lastName: true,
            nickname: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({
        data: { columns: [], rows: [] },
        lastUpdatedBy: null,
        lastUpdatedAt: null,
        status: 200,
      });
    }

    return NextResponse.json({
      data: entry.data,
      lastUpdatedBy: entry.lastUpdatedBy,
      lastUpdatedAt: entry.updatedAt,
      status: 200,
    });
  } catch (error) {
    console.error("Spreadsheet GET error:", error);

    return jsonError(
      "Internal server error",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const profile = await getCurrentProfile(session.user.email);

    if (!profile) {
      return jsonError("User profile not found", 404);
    }

    if (!canManageFinalRepairs(profile.role)) {
      return jsonError("Admin access required", 403);
    }

    const body = await request.json().catch(() => ({}));
    const projectCode = cleanString(body.projectCode);
    const data = body.data;

    if (!projectCode) {
      return jsonError("Missing projectCode", 400);
    }

    if (!isValidSpreadsheetData(data)) {
      return jsonError(
        "Payload must contain { columns: string[], rows: string[][] }",
        400,
      );
    }

    const existingEntry = await prisma.spreadsheetEntry.findUnique({
      where: { projectCode },
    });

    const entry = await prisma.spreadsheetEntry.upsert({
      where: { projectCode },
      update: {
        data,
        lastUpdatedById: profile.nickname || null,
      },
      create: {
        projectCode,
        data,
        lastUpdatedById: profile.nickname || null,
      },
    });

    const action = existingEntry ? "UPDATE" : "CREATE";

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: profile.role || null,
      action,
      entity: "SpreadsheetEntry",
      entityId: entry.id,
      projectCode,
      summary: existingEntry
        ? `Updated spreadsheet for ${projectCode}`
        : `Created spreadsheet for ${projectCode}`,
      changes: existingEntry
        ? buildChangeSet(
            existingEntry as any,
            {
              data,
              lastUpdatedById: profile.nickname || null,
            } as any,
          )
        : entry,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      data: entry.data,
      spreadsheetEntry: entry,
      status: 200,
    });
  } catch (error) {
    console.error("Spreadsheet POST error:", error);

    return jsonError(
      "Internal server error",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
