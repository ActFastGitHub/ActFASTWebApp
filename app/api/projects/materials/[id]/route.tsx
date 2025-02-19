import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

import { recalcProjectCosts } from "@/app/utils/recalcProjectCosts";

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
      return NextResponse.json({ message: "No data provided", status: 400 });
    }
    const {
      projectCode,
      type,
      description,
      unitOfMeasurement,
      quantityOrdered,
      costPerUnit,
      supplierName,
      supplierContact,
      status,
    } = data;

    if (!projectCode) {
      return NextResponse.json({
        status: 400,
        message: "projectCode is required",
      });
    }
    if (!type) {
      return NextResponse.json({
        status: 400,
        message: "Material 'type' cannot be empty",
      });
    }

    const userProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { nickname: true },
    });

    if (!userProfile) {
      return NextResponse.json({ message: "User profile not found", status: 404 });
    }

    // Recompute total cost
    const computedCost = (quantityOrdered ?? 0) * (costPerUnit ?? 0);

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: {
        projectCode,
        type,
        description,
        unitOfMeasurement,
        quantityOrdered: quantityOrdered ?? 0,
        costPerUnit: costPerUnit ?? 0,
        totalCost: computedCost,
        supplierName,
        supplierContact,
        status,
        lastModifiedById: userProfile.nickname,
        lastModifiedAt: new Date(),
      },
    });

    // Recalc totals
    await recalcProjectCosts(projectCode);

    return NextResponse.json({ material: updatedMaterial, status: 200 });
  } catch (error) {
    console.error("Error updating material:", error);
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

    // Before deleting, find the material to get its projectCode
    const mat = await prisma.material.findUnique({ where: { id } });
    if (!mat) {
      return NextResponse.json({ status: 404, message: "Not found" });
    }

    await prisma.material.delete({ where: { id } });

    // Recalc totals
    await recalcProjectCosts(mat.projectCode);

    return NextResponse.json({ message: "Material deleted", status: 200 });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}
