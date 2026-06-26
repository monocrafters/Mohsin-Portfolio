import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  verifyAdmin,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required." }, { status: 400 });
    }

    const valid = await verifyAdmin(username, password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const token = await createSessionToken(username);
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof Error && error.message.includes("JWT_SECRET")) {
      return NextResponse.json({ error: "JWT_SECRET missing in .env file." }, { status: 500 });
    }

    return NextResponse.json({ error: "Login failed. Try again." }, { status: 500 });
  }
}
