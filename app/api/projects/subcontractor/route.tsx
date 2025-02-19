// api/projects/subcontractor/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

import { recalcProjectCosts } from "@/app/utils/recalcProjectCosts";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const body = await request.json();
    const { projectCode, name, expertise, contactInfo, agreedCost } =
      body.data || {};

    if (!projectCode) {
      return NextResponse.json({
        status: 400,
        error: "projectCode is required",
      });
    }
    if (!name) {
      return NextResponse.json({
        status: 400,
        error: "Subcontractor name is required",
      });
    }

    const userProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { nickname: true },
    });

    if (!userProfile) {
      return NextResponse.json({
        status: 404,
        error: "User profile not found",
      });
    }

    // agreedCost used for now; totalCost is adjusted in recalcProjectCosts
    const newSubcontractor = await prisma.subcontractor.create({
      data: {
        projectCode,
        name,
        expertise,
        contactInfo,
        agreedCost: agreedCost ?? 0,
        createdById: userProfile.nickname,
        createdAt: new Date(),
      },
    });

    // Recalculate the project subtotals
    await recalcProjectCosts(projectCode);

    return NextResponse.json({ subcontractor: newSubcontractor, status: 201 });
  } catch (error) {
    console.error("Error creating subcontractor:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}

// GET with searchTerm logic
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectCode = searchParams.get("projectCode");
    const searchTerm = searchParams.get("searchTerm") || ""; // <-- get the searchTerm
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (projectCode) {
      where.projectCode = projectCode;
    }

    // If we have a searchTerm, search in "name" and "expertise"
    // For partial matching, use "contains" + mode: "insensitive"
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { expertise: { contains: searchTerm, mode: "insensitive" } },
      ];
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
    console.error("Error fetching subcontractors:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}
