// api/projects/route.tsx

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

// Helper function to check if a normalized project code already exists
async function isProjectCodeExist(normalizedCode: string, projectId?: string) {
  const projects = await prisma.project.findMany({
    select: { id: true, code: true },
  });

  return projects.some(
    (project) =>
      project.id !== projectId && project.code.trim().toUpperCase() === normalizedCode
  );
}

// CREATE
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({
        status: 400,
        message: "Project code is required",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    if (await isProjectCodeExist(normalizedCode)) {
      return NextResponse.json({
        status: 409,
        message: "Project code already exists",
      });
    }

    const newProject = await prisma.project.create({
      data: { code: normalizedCode },
    });

    return NextResponse.json({ project: newProject, status: 201 });
  } catch (error) {
    const { code = 500, message = "internal server error" } = error as APIErr;
    return NextResponse.json({
      status: code,
      error: message,
    });
  }
}

// UPDATE (PATCH)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const { id, code, ...data } = await request.json();

    if (!code) {
      return NextResponse.json({
        status: 400,
        message: "Project code is required",
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    if (await isProjectCodeExist(normalizedCode, id)) {
      return NextResponse.json({
        status: 409,
        message: "Project code already exists",
      });
    }

    data.code = normalizedCode;

    const updatedProject = await prisma.project.update({
      where: { id },
      data,
    });

    return NextResponse.json({ project: updatedProject, status: 200 });
  } catch (error) {
    const { code = 500, message = "internal server error" } = error as APIErr;
    return NextResponse.json({
      status: code,
      message: message,
    });
  }
}

// DELETE
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({
        status: 400,
        message: "Project ID is required",
      });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ status: 200, message: "Project deleted successfully" });
  } catch (error) {
    const { code = 500, message = "internal server error" } = error as APIErr;
    return NextResponse.json({
      status: code,
      message: message,
    });
  }
}
