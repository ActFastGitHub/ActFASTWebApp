// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/* ─── ACL (unchanged) ─── */
const ACL: Record<string, string[]> = {
  "pods-mapping": [],
  "memberpage": [],
  "projectspage": [],
  "contentspage": [],
  "projectcosting": ["admin", "owner"],
  "projectmanagement": ["admin", "owner"],
  "inventorymanagementpage": ["admin", "owner"],
};

const norm = (s?: string) => s?.toLowerCase().trim() ?? "";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* access-code guard for /register & /login */
  if (pathname === "/register" || pathname === "/login") {
    const code = req.cookies.get("accessCode");
    if (!code || code.value !== process.env.NEXT_PUBLIC_ACTFAST_ACCESS_CODE)
      return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  /* role guard */
  const slug = norm(pathname.split("/")[1]);
  const allowed = ACL[slug];

  if (allowed?.length) {
    const token = await getToken({
      req,
      // ↓↓↓  same secret that authOptions uses  ↓↓↓
      secret: process.env.SECRET,           // 🔑  FIX
      // or: secret: process.env.NEXTAUTH_SECRET ?? process.env.SECRET
    });

    const userRole = norm((token as any)?.role);

    if (!token || !allowed.includes(userRole))
      return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/register",
    "/login",
    "/projectcosting",
    "/projectcosting/:path*",
    "/projectmanagement",
    "/projectmanagement/:path*",
    "/inventorymanagementpage",
    "/inventorymanagementpage/:path*",
  ],
};
