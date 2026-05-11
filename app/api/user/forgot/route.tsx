// app/api/user/forgot/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createAuditLog, getRequestAuditMeta } from "@/app/libs/auditLog";
import { validateEmail } from "@/app/libs/validations";

const PASSWORD_RESET_EXPIRY_MINUTES = 60;

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://www.actfast.ca"
  ).replace(/\/$/, "");
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required", status: 400 },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email", status: 400 },
        { status: 400 },
      );
    }

    const genericSuccessMessage =
      "If that email exists, a reset link has been sent.";

    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        provider: "credentials",
      },
      select: {
        id: true,
        email: true,
        provider: true,
      },
    });

    // Security: do not reveal whether account exists.
    if (!user?.email) {
      await createAuditLog({
        actorEmail: normalizedEmail,
        actorNickname: null,
        actorRole: null,
        action: "UPDATE",
        entity: "User",
        entityId: null,
        summary:
          "Password reset requested for non-existing or non-credential user",
        changes: {
          requestedEmail: normalizedEmail,
          resetEmailSent: false,
          reason: "User not found or provider is not credentials",
        },
        ...getRequestAuditMeta(request),
      });

      return NextResponse.json(
        { message: genericSuccessMessage, status: 200 },
        { status: 200 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    const expires = new Date(
      Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000,
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${getBaseUrl()}/reset?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset your password",
      text: `You requested a password reset. Click here to set a new password:\n\n${resetUrl}\n\nThis link will expire in ${PASSWORD_RESET_EXPIRY_MINUTES} minutes.`,
    });

    await createAuditLog({
      actorEmail: user.email,
      actorNickname: null,
      actorRole: null,
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      summary: `Password reset requested for ${user.email}`,
      changes: {
        passwordResetRequested: true,
        passwordResetExpires: expires,
        resetEmailSent: true,
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json(
      { message: genericSuccessMessage, status: 200 },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { error: "Internal server error", status: 500 },
      { status: 500 },
    );
  }
}
