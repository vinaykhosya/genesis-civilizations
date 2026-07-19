import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin-genesis";

    if (password !== expectedPassword) {
      return NextResponse.json({ error: "Unauthorized: Invalid password" }, { status: 401 });
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ success: true, token });

    // Set HttpOnly cookie secure configuration
    response.cookies.set({
      name: "genesis_admin_session",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400 // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
