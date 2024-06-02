import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { APIErr } from "@/app/libs/interfaces";
import { Prisma } from "@prisma/client";

// GET ALL ITEMS FOR A BOX WITH PAGINATION AND SEARCH SUPPORT
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const boxId = searchParams.get("boxId") ?? undefined;
	const page = parseInt(searchParams.get("page") || "1", 10);
	const limit = parseInt(searchParams.get("limit") || "10", 10);
	const searchTerm = searchParams.get("searchTerm") || "";
	const skip = (page - 1) * limit;

	try {
		const searchFilter: Prisma.ItemWhereInput = searchTerm
			? {
					OR: [
						{ name: { contains: searchTerm, mode: "insensitive" as Prisma.QueryMode } },
						{ description: { contains: searchTerm, mode: "insensitive" as Prisma.QueryMode } }
					]
			  }
			: {};

		const [items, totalCount] = await Promise.all([
			prisma.item.findMany({
				where: {
					boxId,
					...searchFilter
				},
				skip,
				take: limit,
				include: { lastModifiedBy: true, addedBy: true }
			}),
			prisma.item.count({
				where: {
					boxId,
					...searchFilter
				}
			})
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
		const body = await request.json();
		const { boxId } = body.data;

		await prisma.item.deleteMany({
			where: { boxId: boxId ?? undefined }
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
