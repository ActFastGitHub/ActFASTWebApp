// app/api/projects/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { APIErr } from "@/app/libs/interfaces";
import Holidays from "date-holidays";

// Initialize the holidays library for BC, Canada
const hd = new Holidays("CA", "BC");

// Helper function to add weeks to a date excluding holidays
const addWeeksExcludingHolidays = (startDate: Date, weeks: number): Date => {
  let resultDate = new Date(startDate);
  let daysToAdd = weeks * 7;

  while (daysToAdd > 0) {
    resultDate.setDate(resultDate.getDate() + 1);
    const isWeekend = resultDate.getDay() === 0 || resultDate.getDay() === 6; // 0 = Sunday, 6 = Saturday
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
      project.id !== projectId &&
      project.code.trim().toUpperCase() === normalizedCode,
  );
}

// CREATE
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const { code } = await req.json();

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
      data: {
        code: normalizedCode,
        projectStatus: "Not Started",
      },
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
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const {
      id,
      code,
      dateAttended,
      dateApproved,
      frStartDate,
      lengthWeek,
      ...data
    } = await req.json();

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
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({
        status: 400,
        message: "Project ID is required",
      });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({
      status: 200,
      message: "Project deleted successfully",
    });
  } catch (error) {
    const { code = 500, message = "internal server error" } = error as APIErr;
    return NextResponse.json({
      status: code,
      message: message,
    });
  }
}
