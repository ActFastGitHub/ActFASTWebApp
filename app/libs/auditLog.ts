import prisma from "@/app/libs/prismadb";

type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RESTORE"
  | "EXPORT"
  | "BACKUP";

type AuditLogInput = {
  actorEmail?: string | null;
  actorNickname?: string | null;
  actorRole?: string | null;

  action: AuditAction;
  entity: string;
  entityId?: string | null;

  projectCode?: string | null;
  summary?: string | null;
  changes?: unknown;

  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createAuditLog(input: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorEmail: input.actorEmail || null,
        actorNickname: input.actorNickname || null,
        actorRole: input.actorRole || null,

        action: input.action,
        entity: input.entity,
        entityId: input.entityId || null,

        projectCode: input.projectCode || null,
        summary: input.summary || null,
        changes: input.changes ?? null,

        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
      },
    });
  } catch (error) {
    console.error("AUDIT LOG ERROR:", error);
    return null;
  }
}

export function getRequestAuditMeta(request: Request) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      null,
    userAgent: request.headers.get("user-agent") || null,
  };
}

export function buildChangeSet(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) {
  const changes: Record<
    string,
    {
      before: unknown;
      after: unknown;
    }
  > = {};

  Object.keys(after).forEach((key) => {
    if (before[key] !== after[key]) {
      changes[key] = {
        before: before[key] ?? null,
        after: after[key] ?? null,
      };
    }
  });

  return changes;
}