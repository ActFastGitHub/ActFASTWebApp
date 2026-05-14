// app/api/super-admin/audit-logs/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import { canViewAuditLogs } from "@/app/libs/roles";

export const runtime = "nodejs";

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

function cleanParam(value: string | null) {
  return String(value || "").trim();
}

function toSafeTake(value: string | null) {
  const take = Number(value || 25);
  if (!Number.isFinite(take)) return 25;
  return Math.min(Math.max(take, 5), 100);
}

function toSafeSkip(value: string | null) {
  const skip = Number(value || 0);
  if (!Number.isFinite(skip)) return 0;
  return Math.max(skip, 0);
}

function toSafeDate(value: string) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const profile = await getCurrentProfile(session.user.email);

    if (!canViewAuditLogs(profile?.role)) {
      return jsonError("Super Admin access required", 403);
    }

    const { searchParams } = new URL(request.url);

    const action = cleanParam(searchParams.get("action"));
    const entity = cleanParam(searchParams.get("entity"));
    const entityId = cleanParam(searchParams.get("entityId"));
    const projectCode = cleanParam(searchParams.get("projectCode"));
    const actorEmail = cleanParam(searchParams.get("actorEmail"));
    const search = cleanParam(searchParams.get("search"));

    const from = cleanParam(searchParams.get("from"));
    const to = cleanParam(searchParams.get("to"));

    const fromDate = toSafeDate(from);
    const toDate = toSafeDate(to);

    const take = toSafeTake(searchParams.get("take"));
    const skip = toSafeSkip(searchParams.get("skip"));

    const where = {
      ...(action ? { action } : {}),
      ...(entity ? { entity } : {}),
      ...(entityId ? { entityId } : {}),
      ...(projectCode ? { projectCode } : {}),
      ...(actorEmail
        ? { actorEmail: { contains: actorEmail, mode: "insensitive" as const } }
        : {}),

      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                actorEmail: { contains: search, mode: "insensitive" as const },
              },
              {
                actorNickname: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              { actorRole: { contains: search, mode: "insensitive" as const } },
              { action: { contains: search, mode: "insensitive" as const } },
              { entity: { contains: search, mode: "insensitive" as const } },
              { entityId: { contains: search, mode: "insensitive" as const } },
              {
                projectCode: { contains: search, mode: "insensitive" as const },
              },
              { summary: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      status: 200,
      total,
      take,
      skip,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.max(Math.ceil(total / take), 1),
      logs,
    });
  } catch (error) {
    return jsonError(
      "Failed to load audit logs",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
