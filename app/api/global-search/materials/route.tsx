// api/global-search/materials/route.tsx    

import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("searchTerm") || "";

    const materials = await prisma.material.findMany({
      where: {
        OR: [
          { type: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
          { supplierName: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      include: {
        project: true,
        createdBy: { select: { firstName: true, lastName: true, nickname: true } },
      },
      take: 50,
    });

    return NextResponse.json({ materials });
  } catch (error) {
    console.error("Global material search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
