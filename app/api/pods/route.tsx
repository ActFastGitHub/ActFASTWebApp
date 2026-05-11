// app/api/pods/route.tsx

import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { APIErr } from "@/app/libs/interfaces";
import {
  buildChangeSet,
  createAuditLog,
  getRequestAuditMeta,
} from "@/app/libs/auditLog";
import { normalizeRole } from "@/app/libs/roles";

// READ
export async function GET(request: Request) {
  try {
    const boxes = await prisma.box.findMany();

    return NextResponse.json({ boxes, status: 200 });
  } catch (error) {
    const { code = 500, message = "internal server error" } = error as APIErr;

    return NextResponse.json({
      status: code,
      error: message,
    });
  }
}

// UPDATE
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json(
      { message: "Unauthorized access", status: 401 },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const { boxid, name, color, length, width, height, notes } =
      body.data || {};

    if (!boxid) {
      return NextResponse.json(
        { message: "Box ID is required", status: 400 },
        { status: 400 },
      );
    }

    // Get the active user's profile for ownership/audit tracking
    const profile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: {
        nickname: true,
        firstName: true,
        role: true,
      },
    });

    if (!profile?.nickname) {
      return NextResponse.json(
        { message: "Profile not found", status: 404 },
        { status: 404 },
      );
    }

    // Get existing box data for previousName and audit comparison
    const existing = await prisma.box.findUnique({
      where: { boxNumber: boxid },
      select: {
        id: true,
        boxNumber: true,
        name: true,
        color: true,
        length: true,
        width: true,
        height: true,
        notes: true,
        previousName: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Box not found", status: 404 },
        { status: 404 },
      );
    }

    const cleanedName = typeof name === "string" ? name.trim() : name;

    const isNameChanging =
      typeof cleanedName === "string" &&
      cleanedName.length > 0 &&
      cleanedName !== existing.name;

    const updateData = {
      name,
      color,
      length,
      width,
      height,
      notes,
      ...(isNameChanging ? { previousName: existing.name } : {}),
    };

    const changes = buildChangeSet(existing as any, updateData as any);

    const updateBox = await prisma.box.update({
      where: { boxNumber: boxid },
      data: {
        ...updateData,
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
      entity: "Box",
      entityId: updateBox.id,
      summary: `Updated box ${updateBox.boxNumber}`,
      changes,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json({ updateBox, status: 200 });
  } catch (error) {
    const { code = 500, message = "Internal server error" } = error as APIErr;

    return NextResponse.json(
      { status: code, error: message },
      { status: code },
    );
  }
}
