// app/api/pods/items/disconnect/[id]/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import {
  buildChangeSet,
  createAuditLog,
  getRequestAuditMeta,
} from "@/app/libs/auditLog";
import { normalizeRole } from "@/app/libs/roles";

// DISCONNECT ITEM FROM BOX
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
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
    const { id } = params;

    const existingItem = await prisma.item.findUnique({
      where: { id },
      include: {
        box: true,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        {
          message: "Item not found",
          status: 404,
        },
        { status: 404 },
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

    const disconnectedAt = new Date();

    const updateData = {
      packedStatus: "Out",
      packedOutAt: disconnectedAt,
      boxId: null,
    };

    const changes = buildChangeSet(existingItem as any, updateData as any);

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        box: {
          disconnect: true,
        },

        packedStatus: "Out",
        packedOutAt: disconnectedAt,

        lastModifiedBy: {
          connect: { nickname: profile.nickname },
        },
      },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: normalizeRole(profile.role),

      action: "UPDATE",
      entity: "Item",
      entityId: updatedItem.id,

      projectCode: updatedItem.projectCode,

      summary: `Disconnected item "${updatedItem.name}" from box`,

      changes,

      ...getRequestAuditMeta(request),
    });

    return NextResponse.json(
      {
        updatedItem,
        status: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DISCONNECT ITEM ERROR:", error);

    return NextResponse.json(
      {
        status: 500,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
