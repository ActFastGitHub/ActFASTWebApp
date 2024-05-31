import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";
import { APIErr } from "@/app/libs/interfaces";

// READ
export async function GET() {
	try {
		const boxes = await prisma.box.groupBy({
			by: ["name"],
			_count: {
				name: true
			},
			where: {
				color: {
					not: "bg-blue-500"
				}
			}
		});

		return NextResponse.json({ boxes, status: 200 });
	} catch (error) {
		const { code = 500, message = "internal server error" } = error as APIErr;
		return NextResponse.json({
			status: code,
			error: message
		});
	}
}
