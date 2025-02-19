// api/projects/laborcost/[id]/route.tsx


import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

import { recalcProjectCosts } from "@/app/utils/recalcProjectCosts";


export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const laborCost = await prisma.laborCost.findUnique({
      where: { id },
    });

    if (!laborCost) {
      return NextResponse.json(
        { error: "Labor cost entry not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(laborCost, { status: 200 });
  } catch (error) {
    console.error("Error fetching labor cost entry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } },
  ) {
    const session = await getServerSession(authOptions);
  
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized access", status: 401 });
    }
  
    try {
      const { id } = params;
      const { data } = await request.json();
      if (!data) {
        return NextResponse.json({ status: 400, error: "No data provided" });
      }
  
      const { projectCode, employeeName, role, hoursWorked, hourlyRate } = data;
      if (!projectCode) {
        return NextResponse.json({
          status: 400,
          error: "projectCode is required",
        });
      }
      if (!employeeName) {
        return NextResponse.json({
          status: 400,
          error: "Employee name cannot be empty",
        });
      }
  
      const finalHourlyRate = hourlyRate ?? 35;
      const totalCost = (hoursWorked ?? 0) * finalHourlyRate;
  
      const userProfile = await prisma.profile.findUnique({
        where: { userEmail: session.user.email },
        select: { nickname: true },
      });
  
      if (!userProfile) {
        return NextResponse.json({ message: "User profile not found", status: 404 });
      }
  
      const updatedLaborCost = await prisma.laborCost.update({
        where: { id },
        data: {
          projectCode,
          employeeName,
          role,
          hoursWorked: hoursWorked ?? 0,
          hourlyRate: finalHourlyRate,
          totalCost,
          lastModifiedById: userProfile.nickname,
          lastModifiedAt: new Date(),
        },
      });
  
      await recalcProjectCosts(projectCode);
  
      return NextResponse.json({ laborCost: updatedLaborCost, status: 200 });
    } catch (error) {
      console.error("Error updating labor cost entry:", error);
      return NextResponse.json({ status: 500, error: "Internal server error" });
    }
  }
  
  export async function DELETE(
    request: Request,
    { params }: { params: { id: string } },
  ) {
    const session = await getServerSession(authOptions);
  
    if (!session) {
      return NextResponse.json({ message: "Unauthorized access", status: 401 });
    }
  
    try {
      const { id } = params;
  
      // Get the labor cost so we know the projectCode
      const labor = await prisma.laborCost.findUnique({ where: { id } });
      if (!labor) {
        return NextResponse.json({ status: 404, message: "Not found" });
      }
  
      await prisma.laborCost.delete({ where: { id } });
  
      await recalcProjectCosts(labor.projectCode);
  
      return NextResponse.json({ message: "Labor cost entry deleted", status: 200 });
    } catch (error) {
      console.error("Error deleting labor cost entry:", error);
      return NextResponse.json({ status: 500, error: "Internal server error" });
    }
  }
  
