// api/projects/laborcost/route.tsx

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
    const { projectCode, employeeName, role, hoursWorked, hourlyRate } =
      body.data || {};

    if (!projectCode) {
      return NextResponse.json({
        status: 400,
        error: "projectCode is required",
      });
    }
    if (!employeeName) {
      return NextResponse.json({
        status: 400,
        error: "employeeName is required",
      });
    }
    const finalHourlyRate = hourlyRate ?? 35;
    const totalCost = (hoursWorked ?? 0) * finalHourlyRate;

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

    const newLaborCost = await prisma.laborCost.create({
      data: {
        projectCode,
        employeeName,
        role,
        hoursWorked: hoursWorked ?? 0,
        hourlyRate: finalHourlyRate,
        totalCost,
        createdById: userProfile.nickname,
        createdAt: new Date(),
      },
    });

    // Recalc
    await recalcProjectCosts(projectCode);

    return NextResponse.json({ laborCost: newLaborCost, status: 201 });
  } catch (error) {
    console.error("Error creating labor cost:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}

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

    const laborCosts = await prisma.laborCost.findMany({
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

    const totalLaborCosts = await prisma.laborCost.count({ where });
    const totalPages = Math.ceil(totalLaborCosts / limit);

    return NextResponse.json({ laborCosts, totalPages, status: 200 });
  } catch (error) {
    console.error("Error fetching labor costs:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}
