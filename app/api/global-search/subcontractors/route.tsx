// api/global-search/subcontractors/route.tsx

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm") || "";

    const subcontractors = await prisma.subcontractor.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { expertise: { contains: searchTerm, mode: "insensitive" } },
          { contactInfo: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: {
        project: true,
        createdBy: { select: { firstName: true, lastName: true, nickname: true } },
      },
      take: 50,
    });

    return NextResponse.json({ subcontractors });
  } catch (error) {
    console.error("Global subcontractor search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
