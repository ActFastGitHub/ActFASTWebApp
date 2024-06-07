// api/pods/items/[id]/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

// GET SPECIFIC ITEM
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        lastModifiedBy: true,
        addedBy: true,
        box: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// UPDATE SPECIFIC ITEM
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({
      message: "Unauthorized access",
      status: 401,
    });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, location, boxed, category, projectCode, notes } =
      body.data;

    const profile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
    });

    if (!profile) {
      return NextResponse.json({
        message: "Profile not found",
        status: 404,
      });
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name,
        description,
        location,
        boxed,
        category,
        projectCode,
        notes,
        lastModifiedBy: {
          connect: { nickname: profile.nickname! },
        },
      },
    });

    return NextResponse.json({ updatedItem, status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: "Internal server error",
    });
  }
}

// DELETE SPECIFIC ITEM
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({
      message: "Unauthorized access",
      status: 401,
    });
  }

  try {
    const { id } = params;
    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Item deleted", status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: "Internal server error",
    });
  }
}
