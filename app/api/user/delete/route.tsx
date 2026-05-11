// app/api/user/delete/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";
import { isAdminRole, normalizeRole } from "@/app/libs/roles";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized", status: 401 },
        { status: 401 },
      );
    }

    const actorProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: {
        nickname: true,
        firstName: true,
        role: true,
      },
    });

    if (!isAdminRole(actorProfile?.role)) {
      return NextResponse.json(
        { error: "Forbidden", status: 403 },
        { status: 403 },
      );
    }

    const { profileId } = await request.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "No profileId provided", status: 400 },
        { status: 400 },
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: true,
        location: {
          include: {
            address: true,
          },
        },
      },
    });

    if (!profile || !profile.user) {
      return NextResponse.json(
        { error: "Profile not found", status: 404 },
        { status: 404 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.profile.delete({
        where: { id: profileId },
      });

      await tx.user.delete({
        where: { id: profile.user.id },
      });
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: actorProfile?.nickname || actorProfile?.firstName || null,
      actorRole: normalizeRole(actorProfile?.role),
      action: "DELETE",
      entity: "User",
      entityId: profile.user.id,
      summary: `Deleted user account: ${profile.user.email || "Unknown email"}`,
      changes: {
        deletedUser: {
          id: profile.user.id,
          name: profile.user.name,
          email: profile.user.email,
          provider: profile.user.provider,
          createdAt: profile.user.createdAt,
        },
        deletedProfile: {
          id: profile.id,
          nickname: profile.nickname,
          firstName: profile.firstName,
          lastName: profile.lastName,
          userEmail: profile.userEmail,
          role: profile.role,
          active: profile.active,
          isDeleted: profile.isDeleted,
        },
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json(
      { message: "User deleted successfully", status: 200 },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting user:", error);

    return NextResponse.json(
      { error: "Internal server error", status: 500 },
      { status: 500 },
    );
  }
}
