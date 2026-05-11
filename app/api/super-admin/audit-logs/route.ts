// app\api\super-admin\audit-logs\route.ts

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

function toSafeTake(value: string | null) {
  const take = Number(value || 100);
  if (!Number.isFinite(take)) return 100;
  return Math.min(Math.max(take, 1), 500);
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

    const action = String(searchParams.get("action") || "").trim();
    const entity = String(searchParams.get("entity") || "").trim();
    const entityId = String(searchParams.get("entityId") || "").trim();
    const projectCode = String(searchParams.get("projectCode") || "").trim();
    const actorEmail = String(searchParams.get("actorEmail") || "").trim();

    const from = String(searchParams.get("from") || "").trim();
    const to = String(searchParams.get("to") || "").trim();

    const take = toSafeTake(searchParams.get("take"));
    const skip = Number(searchParams.get("skip") || 0);

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(action ? { action } : {}),
        ...(entity ? { entity } : {}),
        ...(entityId ? { entityId } : {}),
        ...(projectCode ? { projectCode } : {}),
        ...(actorEmail ? { actorEmail } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
      skip: Number.isFinite(skip) ? Math.max(skip, 0) : 0,
    });

    const total = await prisma.auditLog.count({
      where: {
        ...(action ? { action } : {}),
        ...(entity ? { entity } : {}),
        ...(entityId ? { entityId } : {}),
        ...(projectCode ? { projectCode } : {}),
        ...(actorEmail ? { actorEmail } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
    });

    return NextResponse.json({
      status: 200,
      total,
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
