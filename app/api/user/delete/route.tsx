// app/api/user/delete/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Only admin or owner can delete
    if (session.user?.role !== "admin" && session.user?.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { profileId } = await request.json();
    if (!profileId) {
      return NextResponse.json(
        { error: "No profileId provided" },
        { status: 400 },
      );
    }

    // Grab the Profile to get the associated user id
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });
    if (!profile || !profile.user) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // We'll delete the Profile and then the User in a transaction
    // Because of the onDelete: Cascade from Profile->Location->Address,
    // you don't need to manually remove them.
    // If you want to remove the user first, just reverse the steps
    // (but then you need onDelete: Cascade at the user->Profile level).
    await prisma.$transaction(async (tx) => {
      // Delete the Profile
      await tx.profile.delete({
        where: { id: profileId },
      });
      // Then remove the User
      await tx.user.delete({
        where: { id: profile.user.id },
      });
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
