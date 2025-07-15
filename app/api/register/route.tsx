// api/register/route.tsx

import bcrypt from "bcrypt";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";
import { APIErr } from "@/app/libs/interfaces";
import { validateEmail, validatePassword } from "@/app/libs/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, confirmpassword } = body;
    const exist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!name) throw { code: 400, message: "Please enter a name" };
    if (!email) throw { code: 400, message: "Please enter your email" };
    if (!validateEmail(email)) {
      throw { code: 400, message: "Please enter a valid email" };
    }

    if (exist) {
      throw {
        code: 400,
        message: "Email already exists",
      };
    }

    if (!password) throw { code: 400, message: "Please enter your password" };
    if (!confirmpassword)
      throw { code: 400, message: "Please confirm your password" };
    if (password !== confirmpassword)
      throw {
        code: 400,
        message: "Password and Confirm Password doesn't match",
      };

    if (!validatePassword(password)) {
      throw {
        code: 400,
        message:
          "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        provider: "credentials",
      },
    });

    return NextResponse.json({
      user,
      status: 200,
    });
  } catch (error) {
    const { code = 500, message = "internal server error" } = error as APIErr;
    return NextResponse.json({
      status: code,
      error: message,
    });
  }
}
