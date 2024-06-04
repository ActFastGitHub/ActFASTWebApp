import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { APIErr } from "@/app/libs/interfaces";

// READ
export async function GET(request: Request) {
  try {
    const projects = await prisma.project.findMany();
    return NextResponse.json({ projects, status: 200 });
  } catch (error) {
    const { code = 500, message = "internal server error" } = error as APIErr;
    return NextResponse.json({
      status: code,
      error: message,
    });
  }
}
