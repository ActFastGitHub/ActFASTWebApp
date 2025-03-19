// app/api/officesupply/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

/**
 * POST - Create a new OfficeSupply item
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const body = await request.json();
    const { name, description, category, status, quantity } = body.data || {};

    if (!name) {
      return NextResponse.json({
        status: 400,
        error: "OfficeSupply 'name' is required",
      });
    }

    // Get the user's profile (to record who last updated)
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

    // If the status is provided, we set statusUpdatedAt as "now"
    let statusUpdatedAt: Date | undefined;
    if (status) {
      statusUpdatedAt = new Date();
    }

    const newSupply = await prisma.officeSupply.create({
      data: {
        name,
        description,
        category,
        status,
        quantity: quantity ?? 0,
        statusUpdatedAt,
        lastUpdatedById: userProfile.nickname,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ officeSupply: newSupply, status: 201 });
  } catch (error) {
    console.error("Error creating office supply:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}

/**
 * GET - Fetch (paginated) list of OfficeSupply items, with optional search
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build a dynamic where-clause for searching name/description/category/status
    const where: any = {};
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { category: { contains: searchTerm, mode: "insensitive" } },
        { status: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const officeSupplies = await prisma.officeSupply.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        lastUpdatedBy: {
          select: { firstName: true, lastName: true, nickname: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalSupplies = await prisma.officeSupply.count({ where });
    const totalPages = Math.ceil(totalSupplies / limit);

    return NextResponse.json({ officeSupplies, totalPages, status: 200 });
  } catch (error) {
    console.error("Error fetching office supplies:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}
