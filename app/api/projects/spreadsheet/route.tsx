// /app/api/projects/spreadsheet/route.tsx
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectCode = searchParams.get("projectCode");
    if (!projectCode) {
      return NextResponse.json(
        { error: "Missing projectCode" },
        { status: 400 },
      );
    }

    // Include lastUpdatedBy for display
    const entry = await prisma.spreadsheetEntry.findUnique({
      where: { projectCode },
      include: {
        lastUpdatedBy: {
          select: { firstName: true, lastName: true, nickname: true },
        },
      },
    });

    if (!entry) {
      // Return an empty structure if none found
      return NextResponse.json({
        data: { columns: [], rows: [] },
        lastUpdatedBy: null,
      });
    }

    return NextResponse.json({
      data: entry.data,
      lastUpdatedBy: entry.lastUpdatedBy,
    });
  } catch (error) {
    console.error("Spreadsheet GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectCode, data } = body;
    // data => { columns: string[], rows: string[][] }

    if (!projectCode) {
      return NextResponse.json(
        { error: "Missing projectCode" },
        { status: 400 },
      );
    }
    if (!data || !Array.isArray(data.columns) || !Array.isArray(data.rows)) {
      return NextResponse.json(
        {
          error: "Payload must contain { columns: string[], rows: string[][] }",
        },
        { status: 400 },
      );
    }

    // Find user profile
    const userProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { nickname: true },
    });

    // Upsert
    const entry = await prisma.spreadsheetEntry.upsert({
      where: { projectCode }, // because projectCode is unique
      update: {
        data,
        lastUpdatedById: userProfile?.nickname ?? null,
      },
      create: {
        projectCode,
        data,
        lastUpdatedById: userProfile?.nickname ?? null,
      },
    });

    return NextResponse.json({ data: entry.data, status: 200 });
  } catch (error) {
    console.error("Spreadsheet POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
