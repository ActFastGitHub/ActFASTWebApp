import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/authOption";
import { APIErr } from "@/app/libs/interfaces";

// GET SPECIFIC ITEM
export async function GET(request: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params;
		const item = await prisma.item.findUnique({
			where: {
				id: id
			},
			include: {
				lastModifiedBy: true
			}
		});

		if (!item) {
			return NextResponse.json({ error: "Item not found" }, { status: 404 });
		}

		return NextResponse.json(item, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// UPDATE SPECIFIC ITEM
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({
			message: "Unauthorized access",
			status: 401
		});
	}

	try {
		const { id } = params;
		const body = await request.json();
		const { name, description } = body.data;

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

		const updatedItem = await prisma.item.update({
			where: { id: id },
			data: {
				name,
				description,
				lastModifiedBy: {
					connect: { nickname: profile.nickname! }
				}
			}
		});

		return NextResponse.json({ updatedItem, status: 200 });
	} catch (error) {
		return NextResponse.json({
			status: 500,
			error: "Internal server error"
		});
	}
}

// DELETE SPECIFIC ITEM
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({
			message: "Unauthorized access",
			status: 401
		});
	}

	try {
		const { id } = params;
		await prisma.item.delete({
			where: { id: id }
		});

		return NextResponse.json({ message: "Item deleted", status: 200 });
	} catch (error) {
		return NextResponse.json({
			status: 500,
			error: "Internal server error"
		});
	}
}

// export default async (req: Request, context: { params: { id: string } }) => {
//   switch (req.method) {
//     case "GET":
//       return GET(req, context);
//     case "PATCH":
//       return PATCH(req, context);
//     case "DELETE":
//       return DELETE(req, context);
//     default:
//       return NextResponse.json({
//         status: 405,
//         error: `Method ${req.method} Not Allowed`,
//       });
//   }
// };
