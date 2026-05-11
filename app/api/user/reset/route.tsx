// app/api/user/reset/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import bcrypt from "bcrypt";
import { validatePassword } from "@/app/libs/validations";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";

export async function POST(request: Request) {
  try {
    const { token, password, confirmPassword } = await request.json();

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Missing fields", status: 400 },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match", status: 400 },
        { status: 400 },
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number",
          status: 400,
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        provider: true,
      },
    });

    if (!user) {
      await createAuditLog({
        actorEmail: null,
        actorNickname: null,
        actorRole: null,
        action: "UPDATE",
        entity: "User",
        entityId: null,
        summary: "Failed password reset attempt with invalid or expired token",
        changes: {
          passwordResetSuccess: false,
          reason: "Invalid or expired token",
        },
        ...getRequestAuditMeta(request),
      });

      return NextResponse.json(
        { error: "Invalid or expired token", status: 400 },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    await createAuditLog({
      actorEmail: user.email,
      actorNickname: null,
      actorRole: null,
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      summary: `Password reset completed for ${user.email}`,
      changes: {
        passwordResetSuccess: true,
        passwordResetTokenCleared: true,
        passwordResetExpiresCleared: true,
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json(
      {
        message: "Password reset successful",
        status: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        status: 500,
      },
      { status: 500 },
    );
  }
}
