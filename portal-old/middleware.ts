import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect control routes (exclude login page and the login auth api endpoint)
  if (pathname.startsWith("/control")) {
    if (pathname === "/control/login" || pathname === "/api/v1/admin/auth") {
      return NextResponse.next();
    }

    const sessionCookie = req.cookies.get("genesis_admin_session")?.value;
    if (!sessionCookie || !(await verifySessionToken(sessionCookie))) {
      return NextResponse.redirect(new URL("/control/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/control/:path*", "/api/v1/admin/:path*"]
};
