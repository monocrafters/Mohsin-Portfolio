import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb, isMongoConnectionError } from "@/lib/mongodb";

const COOKIE_NAME = "admin_session";
const DEFAULT_USERNAME = "mohsin_ashra";
const DEFAULT_PASSWORD = "Mohsin@030777";

export { COOKIE_NAME };

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in .env");
  }
  return new TextEncoder().encode(secret);
}

function getEnvCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || DEFAULT_USERNAME,
    password: process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD,
  };
}

function verifyEnvCredentials(username: string, password: string) {
  const env = getEnvCredentials();
  return username === env.username && password === env.password;
}

export async function ensureAdminUser() {
  const db = await getDb();
  const admins = db.collection("admins");
  const { username, password } = getEnvCredentials();

  const existing = await admins.findOne({ username });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await admins.insertOne({
      username,
      passwordHash,
      createdAt: new Date(),
    });
  }
}

export async function verifyAdmin(username: string, password: string) {
  const DB_TIMEOUT_MS = 3000;

  const dbAuth = (async () => {
    await ensureAdminUser();
    const db = await getDb();
    const admin = await db.collection("admins").findOne({ username });
    if (!admin || typeof admin.passwordHash !== "string") {
      return verifyEnvCredentials(username, password);
    }
    return bcrypt.compare(password, admin.passwordHash);
  })();

  try {
    return await Promise.race([
      dbAuth,
      new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error("mongo_timeout")), DB_TIMEOUT_MS)
      ),
    ]);
  } catch (error) {
    if (!isMongoConnectionError(error) && !(error instanceof Error && error.message === "mongo_timeout")) {
      console.warn("[auth] Unexpected DB error:", error);
    } else {
      console.warn("[auth] MongoDB unavailable — using .env admin credentials.");
    }
    return verifyEnvCredentials(username, password);
  }
}

export async function createSessionToken(username: string) {
  return new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload as { username?: string; role?: string };
}

export function getSessionCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  const isProd = process.env.NODE_ENV === "production";
  // HTTP on LAN IP (192.168.x.x) requires secure: false
  const secure =
    process.env.COOKIE_SECURE === "true" ? true : process.env.COOKIE_SECURE === "false" ? false : isProd;

  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return null;
  }
  return session;
}
