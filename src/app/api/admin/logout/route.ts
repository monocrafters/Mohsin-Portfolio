import { NextResponse } from "next/server";
import { COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", { ...getSessionCookieOptions(0), maxAge: 0 });
  return response;
}
