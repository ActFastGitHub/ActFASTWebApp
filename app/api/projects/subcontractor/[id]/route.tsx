// api/projects/subcontractor/[id]/route.tsx

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
    const subcontractor = await prisma.subcontractor.findUnique({
      where: { id },
      include: {
        createdBy: { select: { firstName: true, lastName: true, nickname: true } },
        lastModifiedBy: { select: { firstName: true, lastName: true, nickname: true } },
      },
    });

    if (!subcontractor) {
      return NextResponse.json({ error: "Subcontractor not found" }, { status: 404 });
    }

    return NextResponse.json(subcontractor, { status: 200 });
  } catch (error) {
    console.error("Error fetching subcontractor:", error);
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

    const { projectCode, name, expertise, contactInfo, agreedCost } = data;
    if (!projectCode) {
      return NextResponse.json({
        status: 400,
        error: "projectCode is required",
      });
    }
    if (!name) {
      return NextResponse.json({
        status: 400,
        error: "Subcontractor name cannot be empty",
      });
    }

    const userProfile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { nickname: true },
    });
    if (!userProfile) {
      return NextResponse.json({ message: "User profile not found", status: 404 });
    }

    const updatedSubcontractor = await prisma.subcontractor.update({
      where: { id },
      data: {
        projectCode,
        name,
        expertise,
        contactInfo,
        agreedCost: agreedCost ?? 0,
        lastModifiedById: userProfile.nickname,
        lastModifiedAt: new Date(),
      },
    });

    // Recalc
    await recalcProjectCosts(projectCode);

    return NextResponse.json({ subcontractor: updatedSubcontractor, status: 200 });
  } catch (error) {
    console.error("Error updating subcontractor:", error);
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

    // find the sub to retrieve projectCode
    const sub = await prisma.subcontractor.findUnique({ where: { id } });
    if (!sub) {
      return NextResponse.json({ status: 404, message: "Not found" });
    }

    await prisma.subcontractor.delete({ where: { id } });

    // Recalc
    await recalcProjectCosts(sub.projectCode);

    return NextResponse.json({ message: "Subcontractor deleted", status: 200 });
  } catch (error) {
    console.error("Error deleting subcontractor:", error);
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}
