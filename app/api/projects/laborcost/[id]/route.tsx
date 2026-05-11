// app/api/projects/laborcost/[id]/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { recalcProjectCosts } from "@/app/utils/recalcProjectCosts";
import {
  buildChangeSet,
  createAuditLog,
  getRequestAuditMeta,
} from "@/app/libs/auditLog";
import { normalizeRole } from "@/app/libs/roles";

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
        { error: "Labor cost entry not found", status: 404 },
        { status: 404 },
      );
    }

    return NextResponse.json(laborCost, { status: 200 });
  } catch (error) {
    console.error("Error fetching labor cost entry:", error);

    return NextResponse.json(
      { error: "Internal server error", status: 500 },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Unauthorized access", status: 401 },
      { status: 401 },
    );
  }

  try {
    const { id } = params;
    const { data } = await request.json();

    if (!data) {
      return NextResponse.json(
        { status: 400, error: "No data provided" },
        { status: 400 },
      );
    }

    const { projectCode, employeeName, role, hoursWorked, hourlyRate } = data;

    if (!projectCode) {
      return NextResponse.json(
        {
          status: 400,
          error: "projectCode is required",
        },
        { status: 400 },
      );
    }

    if (!employeeName) {
      return NextResponse.json(
        {
          status: 400,
          error: "Employee name cannot be empty",
        },
        { status: 400 },
      );
    }

    const existingLaborCost = await prisma.laborCost.findUnique({
      where: { id },
    });

    if (!existingLaborCost) {
      return NextResponse.json(
        { status: 404, error: "Labor cost entry not found" },
        { status: 404 },
      );
    }

    const userProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: {
        nickname: true,
        firstName: true,
        role: true,
      },
    });

    if (!userProfile?.nickname) {
      return NextResponse.json(
        { message: "User profile not found", status: 404 },
        { status: 404 },
      );
    }

    const finalHoursWorked = Number(hoursWorked ?? 0);
    const finalHourlyRate = Number(hourlyRate ?? 35);
    const totalCost = finalHoursWorked * finalHourlyRate;

    const updateData = {
      projectCode,
      employeeName,
      role,
      hoursWorked: finalHoursWorked,
      hourlyRate: finalHourlyRate,
      totalCost,
      lastModifiedById: userProfile.nickname,
      lastModifiedAt: new Date(),
    };

    const changes = buildChangeSet(existingLaborCost as any, updateData as any);

    const updatedLaborCost = await prisma.laborCost.update({
      where: { id },
      data: updateData,
    });

    await recalcProjectCosts(projectCode);

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: userProfile.nickname || userProfile.firstName || null,
      actorRole: normalizeRole(userProfile.role),
      action: "UPDATE",
      entity: "LaborCost",
      entityId: updatedLaborCost.id,
      projectCode: updatedLaborCost.projectCode,
      summary: `Updated labor cost for ${updatedLaborCost.employeeName}`,
      changes,
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json(
      { laborCost: updatedLaborCost, status: 200 },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating labor cost entry:", error);

    return NextResponse.json(
      { status: 500, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Unauthorized access", status: 401 },
      { status: 401 },
    );
  }

  try {
    const { id } = params;

    const userProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: {
        nickname: true,
        firstName: true,
        role: true,
      },
    });

    if (!userProfile?.nickname) {
      return NextResponse.json(
        { message: "User profile not found", status: 404 },
        { status: 404 },
      );
    }

    const labor = await prisma.laborCost.findUnique({
      where: { id },
    });

    if (!labor) {
      return NextResponse.json(
        { status: 404, message: "Labor cost entry not found" },
        { status: 404 },
      );
    }

    const deletedLaborCost = await prisma.laborCost.delete({
      where: { id },
    });

    await recalcProjectCosts(labor.projectCode);

    await createAuditLog({
      actorEmail: session.user.email,
      actorNickname: userProfile.nickname || userProfile.firstName || null,
      actorRole: normalizeRole(userProfile.role),
      action: "DELETE",
      entity: "LaborCost",
      entityId: deletedLaborCost.id,
      projectCode: deletedLaborCost.projectCode,
      summary: `Deleted labor cost for ${deletedLaborCost.employeeName}`,
      changes: {
        deleted: deletedLaborCost,
      },
      ...getRequestAuditMeta(request),
    });

    return NextResponse.json(
      {
        message: "Labor cost entry deleted",
        laborCost: deletedLaborCost,
        status: 200,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting labor cost entry:", error);

    return NextResponse.json(
      { status: 500, error: "Internal server error" },
      { status: 500 },
    );
  }
}
