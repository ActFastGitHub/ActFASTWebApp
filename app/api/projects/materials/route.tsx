// api/projects/materials/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

// CREATE MATERIAL
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
    } = body.data;

    // Get the user's profile to set `createdById`
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

    const newMaterial = await prisma.material.create({
      data: {
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
        createdById: userProfile.nickname, // Track who created it
        createdAt: new Date(), // Set creation timestamp
      },
    });

    return NextResponse.json({ material: newMaterial, status: 201 });
  } catch (error) {
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}

// READ MATERIALS WITH PAGINATION AND SEARCH
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
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}
