// api/projects/materials/route.tsx

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
      return NextResponse.json({
        status: 400,
        error: "projectCode is required",
      });
    }
    if (!type) {
      return NextResponse.json({
        status: 400,
        error: "Material 'type' is required",
      });
    }

    // Get the user's profile
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

    // Compute total cost
    const computedCost = (quantityOrdered ?? 0) * (costPerUnit ?? 0);

    const newMaterial = await prisma.material.create({
      data: {
        projectCode,
        name: name ?? "",
        type,
        description,
        unitOfMeasurement,
        quantityOrdered: quantityOrdered ?? 0,
        costPerUnit: costPerUnit ?? 0,
        totalCost: computedCost,
        supplierName,
        supplierContact,
        status,
        createdById: userProfile.nickname,
        createdAt: new Date(),
      },
    });

    // Recalculate project totals
    await recalcProjectCosts(projectCode);

    return NextResponse.json({ material: newMaterial, status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectCode = searchParams.get("projectCode");
    const searchTerm = searchParams.get("searchTerm");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (projectCode) {
      where.projectCode = projectCode;
    }
    if (searchTerm) {
      where.OR = [
        { type: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const materials = await prisma.material.findMany({
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

    const totalMaterials = await prisma.material.count({ where });
    const totalPages = Math.ceil(totalMaterials / limit);

    return NextResponse.json({ materials, totalPages, status: 200 });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}
