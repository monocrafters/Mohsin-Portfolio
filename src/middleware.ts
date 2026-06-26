import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (!raw) return [];
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

/** Allow localhost + LAN IPs in dev (mobile testing on 192.168.x.x) */
function isDevLanOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/i.test(
    origin
  );
}

function isOriginAllowed(origin: string, configured: string[]): boolean {
  if (configured.includes("*")) return true;
  if (configured.includes(origin)) return true;
  if (process.env.NODE_ENV !== "production" && isDevLanOrigin(origin)) return true;
  return configured.some((o) => {
    if (o.startsWith("*.")) {
      const suffix = o.slice(1);
      try {
        return new URL(origin).hostname.endsWith(suffix);
      } catch {
        return false;
      }
    }
    return false;
  });
}

function applyCors(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin");
  if (!origin) return response;

  const configured = getCorsOrigins();
  const allowed = isOriginAllowed(origin, configured);

  if (allowed) {
    response.headers.set(
      "Access-Control-Allow-Origin",
      configured.includes("*") ? "*" : origin
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    response.headers.set("Vary", "Origin");
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      return applyCors(request, new NextResponse(null, { status: 204 }));
    }
    return applyCors(request, NextResponse.next());
  }

  if (!pathname.startsWith("/admin/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(new URL("/admin_login", request.url));
  }

  try {
    const { jwtVerify } = await import("jose");
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin_login", request.url));
  }
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/api/:path*"],
};
