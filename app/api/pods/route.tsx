// api/pods/route.tsx

import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { APIErr } from "@/app/libs/interfaces";

// READ
export async function GET(request: Request) {
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

// UPDATE
export async function PATCH(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({
			message: "Unauthorized access",
			status: 401
		});
	} else {
		try {
			const body = await request.json();
			const { boxid, name, color } = body.data;

			// Retrieve the user's profile using their email from the session
			const profile = await prisma.profile.findUnique({
				where: {
					userEmail: session.user.email
				}
			});

			if (!profile) {
				return NextResponse.json({
					message: "Profile not found",
					status: 404
				});
			}

			const updateBox = await prisma.box.update({
				where: {
					boxNumber: boxid
				},
				data: {
					name,
					color,
					lastModifiedBy: {
						connect: {
							nickname: profile.nickname!
						}
					}
				}
			});

			return NextResponse.json({ updateBox, status: 200 });
		} catch (error) {
			const { code = 500, message = "Internal server error" } = error as APIErr;
			return NextResponse.json({
				status: code,
				error: message
			});
		}
	}
}
