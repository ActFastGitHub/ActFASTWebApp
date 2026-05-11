// app/api/projects/subcontractor/route.tsx

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { recalcProjectCosts } from "@/app/utils/recalcProjectCosts";
import { canManageFinalRepairs } from "@/app/libs/roles";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";

function jsonError(message: string, status: number, detail?: string) {
  return NextResponse.json({ message, detail, status }, { status });
}

async function getCurrentProfile(email: string) {
  return prisma.profile.findUnique({
    where: { userEmail: email },
    select: {
      nickname: true,
      firstName: true,
      role: true,
    },
  });
}

function cleanString(value: unknown) {
  return String(value || "").trim();
}

function nullableString(value: unknown) {
  const cleaned = cleanString(value);
  return cleaned || null;
}

function toNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function toSafePage(value: string | null) {
  const page = Number(value || 1);
  return Number.isFinite(page) ? Math.max(page, 1) : 1;
}

function toSafeLimit(value: string | null) {
  const limit = Number(value || 20);

  if (!Number.isFinite(limit)) return 20;

  return Math.min(Math.max(limit, 1), 100);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const profile = await getCurrentProfile(session.user.email);

    if (!profile) {
      return jsonError("User profile not found", 404);
    }

    if (!canManageFinalRepairs(profile.role)) {
      return jsonError("Admin access required", 403);
    }

    const body = await request.json().catch(() => ({}));

    const { projectCode, name, expertise, contactInfo, agreedCost } =
      body.data || {};

    const cleanedProjectCode = cleanString(projectCode);
    const cleanedName = cleanString(name);

    if (!cleanedProjectCode) {
      return jsonError("projectCode is required", 400);
    }

    if (!cleanedName) {
      return jsonError("Subcontractor name is required", 400);
    }

    const project = await prisma.project.findUnique({
      where: { code: cleanedProjectCode },
      select: { code: true },
    });

    if (!project) {
      return jsonError("Project does not exist", 404);
    }

    const newSubcontractor = await prisma.subcontractor.create({
      data: {
        projectCode: cleanedProjectCode,
        name: cleanedName,
        expertise: cleanString(expertise),
        contactInfo: nullableString(contactInfo),
        agreedCost: toNumber(agreedCost, 0),
        createdById: profile.nickname || null,
        lastModifiedById: profile.nickname || null,
      },
    });

    await recalcProjectCosts(cleanedProjectCode);

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: profile.role || null,
      action: "CREATE",
      entity: "Subcontractor",
      entityId: newSubcontractor.id,
      projectCode: newSubcontractor.projectCode,
      summary: `Created subcontractor: ${newSubcontractor.name}`,
      changes: newSubcontractor,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({
      subcontractor: newSubcontractor,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating subcontractor:", error);

    return jsonError(
      "Internal server error",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const projectCode = cleanString(searchParams.get("projectCode"));
    const searchTerm = cleanString(searchParams.get("searchTerm"));
    const page = toSafePage(searchParams.get("page"));
    const limit = toSafeLimit(searchParams.get("limit"));

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
          expertise: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          contactInfo: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ];
    }

    const [subcontractors, totalSubcontractors] = await Promise.all([
      prisma.subcontractor.findMany({
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
      prisma.subcontractor.count({ where }),
    ]);

    const totalPages = Math.ceil(totalSubcontractors / limit);

    return NextResponse.json({
      subcontractors,
      totalSubcontractors,
      totalPages,
      page,
      limit,
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching subcontractors:", error);

    return jsonError(
      "Internal server error",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
