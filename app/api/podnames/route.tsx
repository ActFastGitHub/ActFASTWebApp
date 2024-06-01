// api/podnames/route.tsx

import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";
import { APIErr } from "@/app/libs/interfaces";

// READ
export async function GET() {
	try {
		const boxes = await prisma.box.findMany();

		return NextResponse.json({ boxes, status: 200 });
	} catch (error) {
		const { code = 500, message = "internal server error" } = error as APIErr;
		return NextResponse.json({
			status: code,
			error: message
		});
	}
}
