// app/api/pods/items/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";

import { normalizeRole } from "@/app/libs/roles";

// Function to get the date based on the range
const getDateFromRange = (range: string): Date | undefined => {
  const now = new Date();
  let fromDate;

  switch (range) {
    case "1w":
      fromDate = new Date(now.setDate(now.getDate() - 7));
      break;

    case "1m":
      fromDate = new Date(now.setMonth(now.getMonth() - 1));
      break;

    case "3m":
      fromDate = new Date(now.setMonth(now.getMonth() - 3));
      break;

    case "6m":
      fromDate = new Date(now.setMonth(now.getMonth() - 6));
      break;

    case "1y":
      fromDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;

    default:
      fromDate = undefined;
  }

  return fromDate;
};

// ======================================================
// GET ALL ITEMS WITH FILTERS AND PAGINATION
// ======================================================

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const projectCode = searchParams.get("projectCode") ?? undefined;
  const boxId = searchParams.get("boxId") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const searchTerm = searchParams.get("searchTerm") || "";

  const dateRange = searchParams.get("dateRange") || "all";
  const dateRangeIn = searchParams.get("dateRangeIn") || "all";
  const dateRangeOut = searchParams.get("dateRangeOut") || "all";

  const skip = (page - 1) * limit;

  const fromDate = getDateFromRange(dateRange);
  const fromDateIn = getDateFromRange(dateRangeIn);
  const fromDateOut = getDateFromRange(dateRangeOut);

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

    const boxFilter: Prisma.ItemWhereInput = boxId ? { boxId } : {};

    const categoryFilter: Prisma.ItemWhereInput = category ? { category } : {};

    const dateFilter: Prisma.ItemWhereInput = fromDate
      ? { lastModifiedAt: { gte: fromDate } }
      : {};

    const dateFilterIn: Prisma.ItemWhereInput = fromDateIn
      ? { packedInAt: { gte: fromDateIn } }
      : {};

    const dateFilterOut: Prisma.ItemWhereInput = fromDateOut
      ? { packedOutAt: { gte: fromDateOut } }
      : {};

    const whereClause = {
      ...searchFilter,
      ...projectFilter,
      ...boxFilter,
      ...categoryFilter,
      ...dateFilter,
      ...dateFilterIn,
      ...dateFilterOut,
    };

    const [items, totalCount] = await Promise.all([
      prisma.item.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          lastModifiedBy: true,
          addedBy: true,
        },
      }),

      prisma.item.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        items,
        totalPages,
        totalCount,
        currentPage: page,
        status: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET ITEMS ERROR:", error);

    return NextResponse.json(
      {
        status: 500,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

// ======================================================
// ADD ITEM
// ======================================================

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      {
        message: "Unauthorized access",
        status: 401,
      },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const { name, description, boxed, location, category, projectCode, notes } =
      body.data || {};

    if (!projectCode) {
      return NextResponse.json(
        {
          message: "Project code is required",
          status: 400,
        },
        { status: 400 },
      );
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          message: "Item name is required",
          status: 400,
        },
        { status: 400 },
      );
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userEmail: session.user.email,
      },
      select: {
        nickname: true,
        firstName: true,
        role: true,
      },
    });

    if (!profile?.nickname) {
      return NextResponse.json(
        {
          message: "Profile not found",
          status: 404,
        },
        { status: 404 },
      );
    }

    // Trim item name
    const trimmedName = name.trim();

    // Prevent duplicate item names within same project
    const existingItem = await prisma.item.findFirst({
      where: {
        name: trimmedName,
        projectCode,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        {
          message: "This item name already exists in this project.",
          status: 400,
        },
        { status: 400 },
      );
    }

    const newItem = await prisma.item.create({
      data: {
        name: trimmedName,
        description,
        location,
        category,
        projectCode,
        notes,

        addedBy: {
          connect: {
            nickname: profile.nickname,
          },
        },

        lastModifiedBy: {
          connect: {
            nickname: profile.nickname,
          },
        },

        boxed,
      },
    });

    // ======================================================
    // AUDIT LOG
    // ======================================================

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: normalizeRole(profile.role),

      action: "CREATE",
      entity: "Item",
      entityId: newItem.id,

      projectCode,

      summary: `Created item "${newItem.name}" in project ${projectCode}`,

      changes: {
        created: newItem,
      },

      ...getRequestAuditMeta(request),
    });

    return NextResponse.json(
      {
        newItem,
        status: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("CREATE ITEM ERROR:", error);

    return NextResponse.json(
      {
        status: 500,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
