// app/api/projects/updateProjectStatus/route.tsx

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import Holidays from "date-holidays";
import {
  buildChangeSet,
  createAuditLog,
  getRequestAuditMeta,
} from "@/app/libs/auditLog";

const hd = new Holidays("CA", "BC");

const checkHoliday = (date: Date): boolean => {
  return !!hd.isHoliday(date);
};

const addWeeksExcludingHolidays = (startDate: Date, weeks: number): Date => {
  const resultDate = new Date(startDate);
  let daysToAdd = weeks * 7;

  while (daysToAdd > 0) {
    resultDate.setDate(resultDate.getDate() + 1);

    const isWeekend = resultDate.getDay() === 0 || resultDate.getDay() === 6;

    const isHoliday = checkHoliday(resultDate);

    if (!isWeekend && !isHoliday) {
      daysToAdd -= 1;
    }
  }

  return resultDate;
};

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");

  if (!process.env.UPDATE_API_KEY || apiKey !== process.env.UPDATE_API_KEY) {
    return NextResponse.json(
      {
        error: "Forbidden",
        status: 403,
      },
      { status: 403 },
    );
  }

  try {
    const projects = await prisma.project.findMany();
    const currentDate = new Date();

    const updatedProjects = [];

    for (const project of projects) {
      const updatedData: Record<string, unknown> = {};

      if (project.completionDate) {
        const completionDate = new Date(project.completionDate);

        if (
          currentDate > completionDate &&
          project.projectStatus !== "Overdue"
        ) {
          updatedData.projectStatus = "Overdue";
        }
      }

      if (Object.keys(updatedData).length > 0) {
        const changes = buildChangeSet(project as any, updatedData as any);

        const updatedProject = await prisma.project.update({
          where: { id: project.id },
          data: updatedData,
        });

        await createAuditLog({
          actorEmail: "system",
          actorNickname: "System Auto Status Update",
          actorRole: "system",
          action: "UPDATE",
          entity: "Project",
          entityId: updatedProject.id,
          projectCode: updatedProject.code,
          summary: `Automatically updated project status for ${updatedProject.code}`,
          changes,
          ...getRequestAuditMeta(req),
        });

        updatedProjects.push({
          id: updatedProject.id,
          code: updatedProject.code,
          projectStatus: updatedProject.projectStatus,
        });
      }
    }

    return NextResponse.json({
      message: "Project statuses updated successfully.",
      updatedCount: updatedProjects.length,
      updatedProjects,
      status: 200,
    });
  } catch (error) {
    console.error("Error updating project statuses:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        detail: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      },
      { status: 500 },
    );
  }
}
