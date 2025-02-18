// api/projects/subcontractor/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

// CREATE SUBCONTRACTOR
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const body = await request.json();
    const { projectCode, name, expertise, contactInfo, agreedCost } = body.data;

    // Get user profile for tracking
    const userProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { nickname: true },
    });

    if (!userProfile) {
      return NextResponse.json({
        message: "User profile not found",
        status: 404,
      });
    }

    const newSubcontractor = await prisma.subcontractor.create({
      data: {
        projectCode,
        name,
        expertise,
        contactInfo,
        agreedCost,
        createdById: userProfile.nickname,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ subcontractor: newSubcontractor, status: 201 });
  } catch (error) {
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}

// GET ALL SUBCONTRACTORS WITH PAGINATION
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectCode = searchParams.get("projectCode");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (projectCode) {
      where.projectCode = projectCode;
    }

    const subcontractors = await prisma.subcontractor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        createdBy: {
          select: { firstName: true, lastName: true, nickname: true },
        },
        lastModifiedBy: {
          select: { firstName: true, lastName: true, nickname: true },
        },
      },
    });

    const totalSubcontractors = await prisma.subcontractor.count({ where });
    const totalPages = Math.ceil(totalSubcontractors / limit);

    return NextResponse.json({ subcontractors, totalPages, status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}
