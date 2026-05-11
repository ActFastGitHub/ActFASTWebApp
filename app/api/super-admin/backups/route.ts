// app\api\super-admin\backups\route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import prisma from "@/app/libs/prismadb";
import { canRunBackups } from "@/app/libs/roles";

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

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const profile = await getCurrentProfile(session.user.email);

    if (!canRunBackups(profile?.role)) {
      return jsonError("Super Admin access required", 403);
    }

    const backupLogs = await prisma.backupLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    const lastSuccessfulBackup = await prisma.backupLog.findFirst({
      where: {
        status: "SUCCESS",
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return NextResponse.json({
      status: 200,
      lastSuccessfulBackup,
      backupLogs,
    });
  } catch (error) {
    return jsonError(
      "Failed to load backup history",
      500,
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}
