// app/api/officesupply/[id]/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

/**
 * PATCH - Update an OfficeSupply item by ID
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const { id } = params;
    const { data } = await request.json();
    if (!data) {
      return NextResponse.json({ message: "No data provided", status: 400 });
    }

    const { name, description, category, status, quantity } = data;

    // Get the user’s profile
    const userProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { nickname: true },
    });
    if (!userProfile) {
      return NextResponse.json({
        status: 404,
        error: "User profile not found",
      });
    }

    // If status changed, we can bump statusUpdatedAt to now
    // (Alternatively, you could detect if it changed from old -> new, but for simplicity we just update if present.)
    let statusUpdatedAt: Date | undefined;
    if (typeof status === "string") {
      statusUpdatedAt = new Date();
    }

    const updatedSupply = await prisma.officeSupply.update({
      where: { id },
      data: {
        name,
        description,
        category,
        status,
        quantity,
        ...(statusUpdatedAt && { statusUpdatedAt }),
        lastUpdatedById: userProfile.nickname,
        updatedAt: new Date(),
      },
      include: {
        lastUpdatedBy: {
          select: { firstName: true, lastName: true, nickname: true },
        },
      },
    });

    return NextResponse.json({ officeSupply: updatedSupply, status: 200 });
  } catch (error) {
    console.error("Error updating office supply:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}

/**
 * DELETE - Remove an OfficeSupply item by ID
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: 401, error: "Unauthorized" });
    }

    const { id } = params;
    const existing = await prisma.officeSupply.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({
        status: 404,
        error: "OfficeSupply not found",
      });
    }

    await prisma.officeSupply.delete({ where: { id } });
    return NextResponse.json({ message: "OfficeSupply deleted", status: 200 });
  } catch (error) {
    console.error("Error deleting office supply:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}
