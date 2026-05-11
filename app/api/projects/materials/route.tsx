// app/api/projects/materials/route.tsx

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

    const {
      projectCode,
      name,
      type,
      description,
      unitOfMeasurement,
      quantityOrdered,
      costPerUnit,
      supplierName,
      supplierContact,
      status,
    } = body.data || {};

    if (!projectCode) {
      return NextResponse.json(
        {
          status: 400,
          error: "projectCode is required",
        },
        { status: 400 },
      );
    }

    if (!type) {
      return NextResponse.json(
        {
          status: 400,
          error: "Material 'type' is required",
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
          status: 404,
          error: "User profile not found",
        },
        { status: 404 },
      );
    }

    const finalQuantityOrdered = Number(quantityOrdered ?? 0);
    const finalCostPerUnit = Number(costPerUnit ?? 0);
    const computedCost = finalQuantityOrdered * finalCostPerUnit;

    const newMaterial = await prisma.material.create({
      data: {
        projectCode,
        name: name ?? "",
        type,
        description,
        unitOfMeasurement,
        quantityOrdered: finalQuantityOrdered,
        costPerUnit: finalCostPerUnit,
        totalCost: computedCost,
        supplierName,
        supplierContact,
        status,
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
      entity: "Material",
      entityId: newMaterial.id,
      projectCode: newMaterial.projectCode,
      summary: `Created material: ${newMaterial.name || newMaterial.type}`,
      changes: {
        created: newMaterial,
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json(
      { material: newMaterial, status: 201 },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating material:", error);

    return NextResponse.json(
      { status: 500, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET with updated searchTerm logic
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
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          type: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          supplierName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          status: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ];
    }

    const [materials, totalMaterials] = await Promise.all([
      prisma.material.findMany({
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

      prisma.material.count({ where }),
    ]);

    const totalPages = Math.ceil(totalMaterials / limit);

    return NextResponse.json(
      {
        materials,
        totalMaterials,
        totalPages,
        currentPage: page,
        status: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching materials:", error);

    return NextResponse.json(
      { status: 500, error: "Internal server error" },
      { status: 500 },
    );
  }
}
