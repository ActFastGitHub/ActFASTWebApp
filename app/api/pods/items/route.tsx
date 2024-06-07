// api/pods/item/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

// GET ALL ITEMS WITH FILTERS AND PAGINATION
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectCode = searchParams.get("projectCode") ?? undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const searchTerm = searchParams.get("searchTerm") || "";
  const skip = (page - 1) * limit;

  try {
    const searchFilter: Prisma.ItemWhereInput = searchTerm
      ? {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
            {
              description: {
                contains: searchTerm,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
          ],
        }
      : {};

    const projectFilter: Prisma.ItemWhereInput = projectCode
      ? { projectCode }
      : {};

    const [items, totalCount] = await Promise.all([
      prisma.item.findMany({
        where: {
          ...searchFilter,
          ...projectFilter,
        },
        skip,
        take: limit,
        include: { lastModifiedBy: true, addedBy: true },
      }),
      prisma.item.count({
        where: {
          ...searchFilter,
          ...projectFilter,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({ items, totalPages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: "Internal server error",
    });
  }
}

// ADD ITEM
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({
      message: "Unauthorized access",
      status: 401,
    });
  }

  try {
    const body = await request.json();
    const { name, description, boxed, location, category, projectCode, notes } =
      body.data;

    if (!projectCode) {
      return NextResponse.json({
        message: "Project code is required",
        status: 400,
      });
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userEmail: session.user.email,
      },
    });

    if (!profile) {
      return NextResponse.json({
        message: "Profile not found",
        status: 404,
      });
    }

    const newItem = await prisma.item.create({
      data: {
        name,
        description,
        location,
        category,
        projectCode,
        notes,
        addedBy: {
          connect: { nickname: profile.nickname! },
        },
        lastModifiedBy: {
          connect: { nickname: profile.nickname! },
        },
        boxed: boxed,
      },
    });

    return NextResponse.json({ newItem, status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: "Internal server error",
    });
  }
}
