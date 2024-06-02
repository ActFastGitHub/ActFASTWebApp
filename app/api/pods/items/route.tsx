import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { APIErr } from "@/app/libs/interfaces";

// GET ALL ITEMS FOR A BOX
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const boxId = searchParams.get("boxId");
	const page = parseInt(searchParams.get("page") || "1", 10);
	const limit = parseInt(searchParams.get("limit") || "50", 10);
	const skip = (page - 1) * limit;

	try {
		const [items, totalCount] = await Promise.all([
			prisma.item.findMany({
				where: { boxId: boxId ?? undefined },
				skip,
				take: limit,
				include: { lastModifiedBy: true, addedBy: true }
			}),
			prisma.item.count({ where: { boxId: boxId ?? undefined } })
		]);

		const totalPages = Math.ceil(totalCount / limit);

		return NextResponse.json({ items, totalPages }, { status: 200 });
	} catch (error) {
		const { code = 500, message = "internal server error" } = error as APIErr;
		return NextResponse.json({
			status: code,
			error: message
		});
	}
}

// ADD ITEM TO A BOX
export async function POST(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({
			message: "Unauthorized access",
			status: 401
		});
	}

	try {
		const body = await request.json();
		const { boxId, name } = body.data;

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

		const newItem = await prisma.item.create({
			data: {
				name,
				box: {
					connect: { boxNumber: boxId }
				},
				addedBy: {
					connect: { nickname: profile.nickname! }
				},
				lastModifiedBy: {
					connect: { nickname: profile.nickname! }
				}
			}
		});

		return NextResponse.json({ newItem, status: 200 });
	} catch (error) {
		const { code = 500, message = "Internal server error" } = error as APIErr;
		return NextResponse.json({
			status: code,
			error: message
		});
	}
}

// DELETE ALL ITEMS FOR A BOX
export async function DELETE(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({
			message: "Unauthorized access",
			status: 401
		});
	}

	try {
		const { boxId } = await request.json();

		await prisma.item.deleteMany({
			where: { boxId }
		});

		return NextResponse.json({ message: "All items deleted", status: 200 });
	} catch (error) {
		const { code = 500, message = "internal server error" } = error as APIErr;
		return NextResponse.json({
			status: code,
			error: message
		});
	}
}

export default async (req: Request) => {
	switch (req.method) {
		case "GET":
			return GET(req);
		case "POST":
			return POST(req);
		case "DELETE":
			return DELETE(req);
		default:
			return NextResponse.json({
				status: 405,
				error: `Method ${req.method} Not Allowed`
			});
	}
};
