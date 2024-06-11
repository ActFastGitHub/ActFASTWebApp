// api/projects/materials/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

// CREATE
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const data = await request.json();
    const newMaterial = await prisma.material.create({ data });

    return NextResponse.json({ material: newMaterial, status: 201 });
  } catch (error) {
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}

// READ
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
    });

    const totalMaterials = await prisma.material.count({ where });
    const totalPages = Math.ceil(totalMaterials / limit);

    return NextResponse.json({ materials, totalPages, status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}