// app/api/projects/route.tsx

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { APIErr } from "@/app/libs/interfaces";
import Holidays from "date-holidays";

import {
  buildChangeSet,
  createAuditLog,
  getRequestAuditMeta,
} from "@/app/libs/auditLog";

import { canManageFinalRepairs } from "@/app/libs/roles";

// Initialize the holidays library for BC, Canada
const hd = new Holidays("CA", "BC");

function jsonError(message: string, status: number, detail?: string) {
  return NextResponse.json(
    {
      status,
      message,
      detail,
    },
    { status },
  );
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

function cleanString(value: unknown) {
  return String(value || "").trim();
}

// Helper function to add weeks to a date excluding holidays
const addWeeksExcludingHolidays = (startDate: Date, weeks: number): Date => {
  let resultDate = new Date(startDate);
  let daysToAdd = weeks * 7;

  while (daysToAdd > 0) {
    resultDate.setDate(resultDate.getDate() + 1);

    const isWeekend = resultDate.getDay() === 0 || resultDate.getDay() === 6;

    const isHoliday = hd.isHoliday(resultDate);

    if (!isWeekend && !isHoliday) {
      daysToAdd -= 1;
    }
  }

  return resultDate;
};

// READ
export async function GET(req: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        code: "desc",
      },
    });

    return NextResponse.json({
      projects,
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

// Helper function to check if a normalized project code already exists
async function isProjectCodeExist(normalizedCode: string, projectId?: string) {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      code: true,
    },
  });

  return projects.some(
    (project) =>
      project.id !== projectId &&
      project.code.trim().toUpperCase() === normalizedCode,
  );
}

// CREATE
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return jsonError("Unauthorized", 401);
    }

    const profile = await getCurrentProfile(session.user.email);

    if (!profile) {
      return jsonError("User profile not found", 404);
    }

    if (!canManageFinalRepairs(profile.role)) {
      return jsonError("Admin access required", 403);
    }

    const body = await req.json().catch(() => ({}));

    const code = cleanString(body.code);

    if (!code) {
      return jsonError("Project code is required", 400);
    }

    const normalizedCode = code.toUpperCase();

    if (await isProjectCodeExist(normalizedCode)) {
      return jsonError("Project code already exists", 409);
    }

    const newProject = await prisma.project.create({
      data: {
        code: normalizedCode,
        projectStatus: "Not Started",
      },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: profile.role || null,
      action: "CREATE",
      entity: "Project",
      entityId: newProject.id,
      projectCode: newProject.code,
      summary: `Created project ${newProject.code}`,
      changes: newProject,
      ...getRequestAuditMeta(req),
    });

    return NextResponse.json({
      project: newProject,
      status: 201,
    });
  } catch (error) {
    const { code = 500, message = "internal server error" } = error as APIErr;

    return NextResponse.json({
      status: code,
      error: message,
    });
  }
}

// UPDATE (PATCH)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return jsonError("Unauthorized", 401);
    }

    const profile = await getCurrentProfile(session.user.email);

    if (!profile) {
      return jsonError("User profile not found", 404);
    }

    if (!canManageFinalRepairs(profile.role)) {
      return jsonError("Admin access required", 403);
    }

    const body = await req.json().catch(() => ({}));

    const {
      id,
      code,
      dateAttended,
      dateApproved,
      frStartDate,
      lengthWeek,
      ...data
    } = body;

    if (!id) {
      return jsonError("Project ID is required", 400);
    }

    if (!code) {
      return jsonError("Project code is required", 400);
    }

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return jsonError("Project not found", 404);
    }

    const normalizedCode = cleanString(code).toUpperCase();

    if (await isProjectCodeExist(normalizedCode, id)) {
      return jsonError("Project code already exists", 409);
    }

    data.code = normalizedCode;

    if (dateAttended) {
      data.projectStatus = "Emergency";
    }

    if (dateApproved) {
      data.projectStatus = "Final Repairs";
    }

    if (frStartDate && lengthWeek && data.projectStatus === "Final Repairs") {
      const frStart = new Date(frStartDate);

      const completionDate = addWeeksExcludingHolidays(
        frStart,
        parseInt(lengthWeek),
      );

      const packBackDate = new Date(completionDate);

      packBackDate.setDate(packBackDate.getDate() - 3);

      data.completionDate = completionDate.toISOString().split("T")[0];

      data.packBackDate = packBackDate.toISOString().split("T")[0];

      const currentDate = new Date();

      if (currentDate > completionDate) {
        data.projectStatus = "Overdue";
      }
    }

    const changes = buildChangeSet(existingProject as any, data as any);

    const updatedProject = await prisma.project.update({
      where: { id },
      data,
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: profile.role || null,
      action: "UPDATE",
      entity: "Project",
      entityId: updatedProject.id,
      projectCode: updatedProject.code,
      summary: `Updated project ${updatedProject.code}`,
      changes,
      ...getRequestAuditMeta(req),
    });

    return NextResponse.json({
      project: updatedProject,
      status: 200,
    });
  } catch (error) {
    const { code = 500, message = "internal server error" } = error as APIErr;

    return NextResponse.json({
      status: code,
      message,
    });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return jsonError("Unauthorized", 401);
    }

    const profile = await getCurrentProfile(session.user.email);

    if (!profile) {
      return jsonError("User profile not found", 404);
    }

    if (!canManageFinalRepairs(profile.role)) {
      return jsonError("Admin access required", 403);
    }

    const body = await req.json().catch(() => ({}));

    const id = cleanString(body.id);

    if (!id) {
      return jsonError("Project ID is required", 400);
    }

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return jsonError("Project not found", 404);
    }

    const deletedProject = await prisma.project.delete({
      where: { id },
    });

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: profile.nickname || profile.firstName || null,
      actorRole: profile.role || null,
      action: "DELETE",
      entity: "Project",
      entityId: deletedProject.id,
      projectCode: deletedProject.code,
      summary: `Deleted project ${deletedProject.code}`,
      changes: deletedProject,
      ...getRequestAuditMeta(req),
    });

    return NextResponse.json({
      status: 200,
      message: "Project deleted successfully",
      project: deletedProject,
    });
  } catch (error) {
    const { code = 500, message = "internal server error" } = error as APIErr;

    return NextResponse.json({
      status: code,
      message,
    });
  }
}
