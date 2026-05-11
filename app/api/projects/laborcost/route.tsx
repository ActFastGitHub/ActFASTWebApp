// app/api/projects/laborcost/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { recalcProjectCosts } from "@/app/utils/recalcProjectCosts";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";
import { normalizeRole } from "@/app/libs/roles";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { status: 401, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const { projectCode, employeeName, role, hoursWorked, hourlyRate } =
      body.data || {};

    if (!projectCode) {
      return NextResponse.json(
        {
          status: 400,
          error: "projectCode is required",
        },
        { status: 400 },
      );
    }

    if (!employeeName) {
      return NextResponse.json(
        {
          status: 400,
          error: "employeeName is required",
        },
        { status: 400 },
      );
    }

    const userProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: {
        nickname: true,
        firstName: true,
        role: true,
      },
    });

    if (!userProfile?.nickname) {
      return NextResponse.json(
        {
          message: "User profile not found",
          status: 404,
        },
        { status: 404 },
      );
    }

    const finalHoursWorked = Number(hoursWorked ?? 0);
    const finalHourlyRate = Number(hourlyRate ?? 35);
    const totalCost = finalHoursWorked * finalHourlyRate;

    const newLaborCost = await prisma.laborCost.create({
      data: {
        projectCode,
        employeeName,
        role,
        hoursWorked: finalHoursWorked,
        hourlyRate: finalHourlyRate,
        totalCost,
        createdById: userProfile.nickname,
        lastModifiedById: userProfile.nickname,
        createdAt: new Date(),
      },
    });

    await recalcProjectCosts(projectCode);

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: userProfile.nickname || userProfile.firstName || null,
      actorRole: normalizeRole(userProfile.role),
      action: "CREATE",
      entity: "LaborCost",
      entityId: newLaborCost.id,
      projectCode: newLaborCost.projectCode,
      summary: `Created labor cost for ${newLaborCost.employeeName}`,
      changes: {
        created: newLaborCost,
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json(
      { laborCost: newLaborCost, status: 201 },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating labor cost:", error);

    return NextResponse.json(
      { status: 500, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET with searchTerm logic
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const projectCode = searchParams.get("projectCode");
    const searchTerm = searchParams.get("searchTerm") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: any = {};

    if (projectCode) {
      where.projectCode = projectCode;
    }

    if (searchTerm) {
      where.OR = [
        {
          employeeName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          role: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ];
    }

    const [laborCosts, totalLaborCosts] = await Promise.all([
      prisma.laborCost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
              nickname: true,
            },
          },
          lastModifiedBy: {
            select: {
              firstName: true,
              lastName: true,
              nickname: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.laborCost.count({ where }),
    ]);

    const totalPages = Math.ceil(totalLaborCosts / limit);

    return NextResponse.json(
      {
        laborCosts,
        totalLaborCosts,
        totalPages,
        currentPage: page,
        status: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching labor costs:", error);

    return NextResponse.json(
      { status: 500, error: "Internal server error" },
      { status: 500 },
    );
  }
}
