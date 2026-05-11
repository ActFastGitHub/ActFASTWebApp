// app/api/equipment/upsert/route.ts

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { isAdminRole } from "@/app/libs/roles";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";

async function getAdminProfile() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      ok: false,
      status: 401 as const,
      session: null,
      profile: null,
    };
  }

  const profile = await prisma.profile.findUnique({
    where: { userEmail: session.user.email },
    select: {
      role: true,
      nickname: true,
      firstName: true,
    },
  });

  return {
    ok: isAdminRole(profile?.role),
    status: 403 as const,
    session,
    profile,
  };
}

export async function POST(req: Request) {
  const auth = await getAdminProfile();

  if (!auth.ok || !auth.session?.user?.email) {
    return NextResponse.json(
      {
        status: auth.status,
        error: "Forbidden",
      },
      {
        status: auth.status,
      },
    );
  }

  const body = await req.json().catch(() => ({}));

  const type = String(body?.type ?? "").trim();

  const assetNumber = Number(body?.assetNumber);

  const model = typeof body?.model === "string" ? body.model.trim() : null;

  const serial = typeof body?.serial === "string" ? body.serial.trim() : null;

  if (!type || !Number.isInteger(assetNumber) || assetNumber <= 0) {
    return NextResponse.json(
      {
        status: 400,
        error: "type and positive integer assetNumber are required",
      },
      {
        status: 400,
      },
    );
  }

  const existing = await prisma.equipment.findUnique({
    where: {
      typeCode_assetNumber: {
        typeCode: type,
        assetNumber,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      {
        status: 409,
        error: `${type} #${assetNumber} already exists`,
      },
      {
        status: 409,
      },
    );
  }

  const created = await prisma.equipment.create({
    data: {
      typeCode: type,
      assetNumber,
      model,
      serial,
      status: "WAREHOUSE",
      archived: false,
    },
  });

  await createAuditLog({
    actorEmail: auth.session.user.email,
    actorNickname: auth.profile?.nickname || auth.profile?.firstName || null,
    actorRole: auth.profile?.role || null,
    action: "CREATE",
    entity: "Equipment",
    entityId: created.id,
    summary: `Created equipment: ${created.typeCode} #${created.assetNumber}`,
    changes: created,
    ...getRequestAuditMeta(req),
  });

  return NextResponse.json({
    status: 200,
    id: created.id,
    created: true,
  });
}
