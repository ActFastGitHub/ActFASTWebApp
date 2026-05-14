// app/api/super-admin/audit-logs/export/route.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import { canViewAuditLogs } from "@/app/libs/roles";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";

export const runtime = "nodejs";

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

function toSafeDate(value: string) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function escapeCsv(value: unknown) {
  const text =
    value === null || value === undefined
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);

  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const profile = await getCurrentProfile(session.user.email);

  if (!canViewAuditLogs(profile?.role)) {
    return new Response("Super Admin access required", { status: 403 });
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
            { actorEmail: { contains: search, mode: "insensitive" as const } },
            {
              actorNickname: { contains: search, mode: "insensitive" as const },
            },
            { actorRole: { contains: search, mode: "insensitive" as const } },
            { action: { contains: search, mode: "insensitive" as const } },
            { entity: { contains: search, mode: "insensitive" as const } },
            { entityId: { contains: search, mode: "insensitive" as const } },
            { projectCode: { contains: search, mode: "insensitive" as const } },
            { summary: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  const headers = [
    "createdAt",
    "actorEmail",
    "actorNickname",
    "actorRole",
    "action",
    "entity",
    "entityId",
    "projectCode",
    "summary",
    "changes",
    "ipAddress",
    "userAgent",
  ];

  const rows = logs.map((log) =>
    [
      log.createdAt.toISOString(),
      log.actorEmail,
      log.actorNickname,
      log.actorRole,
      log.action,
      log.entity,
      log.entityId,
      log.projectCode,
      log.summary,
      log.changes,
      log.ipAddress,
      log.userAgent,
    ]
      .map(escapeCsv)
      .join(","),
  );

  const csv = [headers.map(escapeCsv).join(","), ...rows].join("\n");

  await createAuditLog({
    actorEmail: session.user.email,
    actorNickname: profile?.nickname || profile?.firstName || null,
    actorRole: profile?.role || null,
    action: "EXPORT",
    entity: "AuditLog",
    summary: `Exported ${logs.length} audit log row(s)`,
    changes: {
      exportedRows: logs.length,
      filters: {
        search,
        action,
        entity,
        entityId,
        projectCode,
        actorEmail,
        from,
        to,
      },
    },
    ...getRequestAuditMeta(request),
  });

  const fileName = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
