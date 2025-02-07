// api/projects/materials/[id]/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

// GET SPECIFIC MATERIAL
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        createdBy: { select: { firstName: true, lastName: true, nickname: true } },
        lastModifiedBy: { select: { firstName: true, lastName: true, nickname: true } },
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    return NextResponse.json(material, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// UPDATE SPECIFIC MATERIAL
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
    const body = await request.json();
    const {
      type,
      description,
      unitOfMeasurement,
      quantityOrdered,
      costPerUnit,
      supplierName,
      supplierContact,
      status,
    } = body.data;

    // Get the user's profile (to get the nickname for tracking)
    const userProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { nickname: true },
    });

    if (!userProfile) {
      return NextResponse.json({ message: "User profile not found", status: 404 });
    }

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: {
        type,
        description,
        unitOfMeasurement,
        quantityOrdered,
        costPerUnit,
        supplierName,
        supplierContact,
        status,
        lastModifiedById: userProfile.nickname, // Track who last modified
        lastModifiedAt: new Date(), // Auto-update timestamp
      },
    });

    return NextResponse.json({ material: updatedMaterial, status: 200 });
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}

// DELETE SPECIFIC MATERIAL
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

    await prisma.material.delete({ where: { id } });

    return NextResponse.json({ message: "Material deleted", status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}
