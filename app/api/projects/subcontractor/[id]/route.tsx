// api/projects/subcontractor/[id]/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

// GET SUBCONTRACTOR BY ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// UPDATE SUBCONTRACTOR
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Unauthorized access", status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { name, expertise, contactInfo, agreedCost } = body.data;

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
        name,
        expertise,
        contactInfo,
        agreedCost,
        lastModifiedById: userProfile.nickname,
        lastModifiedAt: new Date(),
      },
    });

    return NextResponse.json({ subcontractor: updatedSubcontractor, status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}

// DELETE SUBCONTRACTOR
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized access", status: 401 });
  }

  try {
    const { id } = params;
    await prisma.subcontractor.delete({ where: { id } });

    return NextResponse.json({ message: "Subcontractor deleted", status: 200 });
  } catch (error) {
    return NextResponse.json({ status: 500, error: "Internal server error" });
  }
}
