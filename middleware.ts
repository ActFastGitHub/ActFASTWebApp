import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
	const url = req.nextUrl.clone();
	const accessCode = req.cookies.get("accessCode");

	if (url.pathname === "/register" || url.pathname === "/login") {
		if (!accessCode || accessCode.value !== process.env.NEXT_PUBLIC_ACTFAST_ACCESS_CODE) {
			url.pathname = "/";
			return NextResponse.redirect(url);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/register", "/login"]
};
