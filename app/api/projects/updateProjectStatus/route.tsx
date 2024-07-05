// app/api/projects/updateProjectStatus/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import Holidays from 'date-holidays';

// Initialize the holidays library for BC, Canada
const hd = new Holidays('CA', 'BC');

// Helper function to check if a date is a holiday
const checkHoliday = (date: Date): boolean => {
  return !!hd.isHoliday(date);
};

// Function to add weeks excluding holidays
const addWeeksExcludingHolidays = (startDate: Date, weeks: number): Date => {
  let resultDate = new Date(startDate);
  let daysToAdd = weeks * 7;

  while (daysToAdd > 0) {
    resultDate.setDate(resultDate.getDate() + 1);
    const isWeekend = resultDate.getDay() === 0 || resultDate.getDay() === 6; // 0 = Sunday, 6 = Saturday
    const isHoliday = checkHoliday(resultDate);
    if (!isWeekend && !isHoliday) {
      daysToAdd -= 1;
    }
  }

  return resultDate;
};

// API route handler
export async function GET(req: NextRequest) {
  console.log('API Key from environment:', process.env.UPDATE_API_KEY); // Temporary log for debugging
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.UPDATE_API_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const projects = await prisma.project.findMany();

    const currentDate = new Date();

    for (const project of projects) {
      let updatedData: any = {};

      if (project.completionDate) {
        const completionDate = new Date(project.completionDate);
        if (currentDate > completionDate && project.projectStatus !== "Overdue") {
          updatedData.projectStatus = "Overdue";
        }
      }

      if (Object.keys(updatedData).length > 0) {
        await prisma.project.update({
          where: { id: project.id },
          data: updatedData,
        });
      }
    }

    return NextResponse.json({ message: "Project statuses updated successfully." });
  } catch (error) {
    console.error("Error updating project statuses:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
