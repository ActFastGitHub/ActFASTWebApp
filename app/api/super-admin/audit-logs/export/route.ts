// app\api\super-admin\audit-logs\export\route.ts

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

  const projectCode = String(searchParams.get("projectCode") || "").trim();
  const action = String(searchParams.get("action") || "").trim();
  const entity = String(searchParams.get("entity") || "").trim();

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(projectCode ? { projectCode } : {}),
      ...(action ? { action } : {}),
      ...(entity ? { entity } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5000,
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
        projectCode,
        action,
        entity,
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
