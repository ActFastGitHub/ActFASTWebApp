// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * ACL map: if a slug is listed with roles, only those roles can access.
 * Empty array means "everyone who is logged-in (or page handles it itself)".
 */
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
  const { pathname, searchParams } = req.nextUrl;

  /* ── Access-code guard for /register & /login (preserve callbackUrl) ── */
  if (pathname === "/register" || pathname === "/login") {
    const code = req.cookies.get("accessCode");
    if (!code || code.value !== process.env.NEXT_PUBLIC_ACTFAST_ACCESS_CODE) {
      const originalCb = searchParams.get("callbackUrl") || "/";
      const url = new URL("/", req.url);
      url.searchParams.set("needAccess", "1");
      url.searchParams.set("callbackUrl", originalCb);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  /* ── Admin-only equipment routes ──
     - Equipment Management (admin console)
     - QR Labels page (bulk printing)
   */
  if (
    pathname.startsWith("/equipment/admin") ||
    pathname.startsWith("/equipment/qr-labels")
  ) {
    const token = await getToken({ req, secret: process.env.SECRET });
    const role = norm((token as any)?.role);
    if (!token || !["admin", "owner"].includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  /* ── Generic role guard via ACL map (for top-level slugs) ── */
  const slug = norm(pathname.split("/")[1]);
  const allowed = ACL[slug];

  if (allowed?.length) {
    const token = await getToken({
      req,
      secret: process.env.SECRET, // same as authOptions secret
    });
    const userRole = norm((token as any)?.role);
    if (!token || !allowed.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

/* Ensure middleware runs on all protected routes */
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

    // Equipment suite (tracking, move, admin, QR)
    "/equipment",
    "/equipment/:path*",
  ],
};
