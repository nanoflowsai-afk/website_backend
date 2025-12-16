import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";

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

export function getAdminFromRequest(req: Request | { headers?: Record<string, string> } ) {
  // support Express `req` or a simple object with `headers` for cookie string
  const cookieHeader = (req as Request).headers?.cookie || (req as any).headers?.cookie || "";
  const cookies = cookieHeader.split(";").map((c: string) => c.trim());
  const tokenPair = cookies.find((c: string) => c.startsWith(ADMIN_TOKEN_NAME + "="));
  const token = tokenPair ? tokenPair.split("=").slice(1).join("=") : null;
  // fallback: support `Authorization: Bearer <token>` header
  let finalToken: string | null = token;
  if (!finalToken) {
    const authHeader = (req as Request).headers?.authorization || (req as any).headers?.authorization || "";
    if (authHeader && typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
      finalToken = authHeader.slice(7).trim() || null;
    }
  }
  if (!finalToken) return null;
  try {
    const payload = jwt.verify(finalToken, JWT_SECRET) as JwtPayload & { adminId?: number };
    if (payload && typeof payload === "object" && typeof payload.adminId === "number") {
      return payload.adminId;
    }
    return null;
  } catch {
    return null;
  }
}

export function setAdminCookie(token: string, res?: Response) {
  const secureFlag = process.env.NODE_ENV === "production";
  const sameSite = secureFlag ? "none" : ADMIN_COOKIE_SAMESITE;
  const cookieValue = `${ADMIN_TOKEN_NAME}=${token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=${sameSite};${ADMIN_COOKIE_DOMAIN ? ` Domain=${ADMIN_COOKIE_DOMAIN};` : ""} HttpOnly`;
  if (res && typeof res.cookie === "function") {
    res.cookie(ADMIN_TOKEN_NAME, token, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: sameSite as "lax" | "strict" | "none",
      domain: ADMIN_COOKIE_DOMAIN,
      path: "/",
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });
    return;
  }
  return cookieValue;
}

export function clearAdminCookie(res?: Response) {
  const secureFlag = process.env.NODE_ENV === "production";
  const sameSite = secureFlag ? "none" : ADMIN_COOKIE_SAMESITE;
  const cookieValue = `${ADMIN_TOKEN_NAME}=; Path=/; Max-Age=0; SameSite=${sameSite};${ADMIN_COOKIE_DOMAIN ? ` Domain=${ADMIN_COOKIE_DOMAIN};` : ""} HttpOnly`;
  if (res && typeof res.clearCookie === "function") {
    res.clearCookie(ADMIN_TOKEN_NAME, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: sameSite as "lax" | "strict" | "none",
      domain: ADMIN_COOKIE_DOMAIN,
      path: "/",
    });
    return;
  }
  return cookieValue;
}

