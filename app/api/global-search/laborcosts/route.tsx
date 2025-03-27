// api/global-search/laborcosts/route.tsx

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm") || "";

    const laborCosts = await prisma.laborCost.findMany({
      where: {
        OR: [
          { employeeName: { contains: searchTerm, mode: "insensitive" } },
          { role: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: {
        project: true,
        createdBy: { select: { firstName: true, lastName: true, nickname: true } },
      },
      take: 50,
    });

    return NextResponse.json({ laborCosts });
  } catch (error) {
    console.error("Global labor cost search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
