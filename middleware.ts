// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/* ─── ACL (same behavior as before) ─── */
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

  /* ── Access-code guard for /register & /login (PATCHED to preserve callbackUrl) ── */
  if (pathname === "/register" || pathname === "/login") {
    const code = req.cookies.get("accessCode");
    if (!code || code.value !== process.env.NEXT_PUBLIC_ACTFAST_ACCESS_CODE) {
      // keep where the user was trying to go (e.g. after scanning a QR)
      const originalCb = req.nextUrl.searchParams.get("callbackUrl") || "/";
      const url = new URL("/", req.url);
      url.searchParams.set("needAccess", "1");
      url.searchParams.set("callbackUrl", originalCb);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  /* ── Optional: server-side hard gate for admin equipment pages ── */
  if (pathname.startsWith("/equipment/qr-labels") || pathname.startsWith("/equipment/admin")) {
    const token = await getToken({ req, secret: process.env.SECRET });
    const role = norm((token as any)?.role);
    if (!token || !["admin", "owner"].includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  /* ── Existing role guard for configured slugs ── */
  const slug = norm(pathname.split("/")[1]);
  const allowed = ACL[slug];

  if (allowed?.length) {
    const token = await getToken({
      req,
      // same secret your authOptions uses
      secret: process.env.SECRET,
    });

    const userRole = norm((token as any)?.role);
    if (!token || !allowed.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

/* Add equipment routes to the matcher so the admin-only gate above can run */
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

    // NEW: equipment routes (tracking, move, admin, qr-labels)
    "/equipment",
    "/equipment/:path*",
  ],
};
