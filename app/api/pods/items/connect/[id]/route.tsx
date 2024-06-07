import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

// CONNECT ITEM TO BOX
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
    const { boxId } = body.data;

    if (!boxId) {
      return NextResponse.json({
        message: "Box ID is required",
        status: 400,
      });
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        box: {
          connect: { boxNumber: boxId },
        },
        packedStatus: "In",
        packedInAt: new Date(),
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
