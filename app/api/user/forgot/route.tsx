// app/api/user/forgot/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user with matching email + credentials
    const user = await prisma.user.findFirst({
      where: {
        email,
        provider: "credentials",
      },
    });

    // For security, always respond with success, even if user not found
    if (!user?.email) {
      return NextResponse.json(
        { message: "If that email exists, a reset link has been sent." },
        { status: 200 },
      );
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    // Save to DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });

    // Create nodemailer transport (Gmail example)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
      },
    });

    // The URL to reset password
    const resetUrl =
      `https://www.actfast.ca/reset?token=${token}`
    // In production, use your domain, e.g. https://myapp.com/reset?token=...

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset your password",
      text: `You requested a password reset. Click here to set a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "If that email exists, a reset link has been sent." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
