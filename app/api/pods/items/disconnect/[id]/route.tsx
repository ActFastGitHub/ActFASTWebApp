// api/pods/items/disconnect/[id]/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

// DISCONNECT ITEM FROM BOX
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

    const profile = await prisma.profile.findUnique({
      where: {
        userEmail: session.user.email,
      },
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
        packedStatus: "Out",
        packedOutAt: new Date(),
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
