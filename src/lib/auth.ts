import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

const ADMIN_TOKEN_NAME = "nano_admin_token";
const rawSameSite = (process.env.ADMIN_COOKIE_SAMESITE || "lax").toLowerCase();
const ADMIN_COOKIE_SAMESITE: "lax" | "strict" | "none" =
  rawSameSite === "none" ? "none" : rawSameSite === "strict" ? "strict" : "lax";
const ADMIN_COOKIE_DOMAIN = process.env.ADMIN_COOKIE_DOMAIN || undefined;

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAdminToken(adminId: number) {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: "7d" });
}

export function getAdminFromRequest(req: NextRequest) {
  const token = req.cookies.get(ADMIN_TOKEN_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload & { adminId?: number };
    if (payload && typeof payload === "object" && typeof payload.adminId === "number") {
      return payload.adminId;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_TOKEN_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: ADMIN_COOKIE_SAMESITE,
    domain: ADMIN_COOKIE_DOMAIN,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_TOKEN_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: ADMIN_COOKIE_SAMESITE,
    domain: ADMIN_COOKIE_DOMAIN,
    path: "/",
    maxAge: 0,
  });
}

