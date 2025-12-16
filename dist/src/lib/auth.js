var _a;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const JWT_SECRET = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
}
const ADMIN_TOKEN_NAME = "nano_admin_token";
const rawSameSite = (process.env.ADMIN_COOKIE_SAMESITE || "lax").toLowerCase();
const ADMIN_COOKIE_SAMESITE = rawSameSite === "none" ? "none" : rawSameSite === "strict" ? "strict" : "lax";
const ADMIN_COOKIE_DOMAIN = process.env.ADMIN_COOKIE_DOMAIN || undefined;
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}
export function signAdminToken(adminId) {
    return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: "7d" });
}
export function getAdminFromRequest(req) {
    var _a, _b, _c, _d;
    // support Express `req` or a simple object with `headers` for cookie string
    const cookieHeader = ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.cookie) || ((_b = req.headers) === null || _b === void 0 ? void 0 : _b.cookie) || "";
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const tokenPair = cookies.find((c) => c.startsWith(ADMIN_TOKEN_NAME + "="));
    const token = tokenPair ? tokenPair.split("=").slice(1).join("=") : null;
    // fallback: support `Authorization: Bearer <token>` header
    let finalToken = token;
    if (!finalToken) {
        const authHeader = ((_c = req.headers) === null || _c === void 0 ? void 0 : _c.authorization) || ((_d = req.headers) === null || _d === void 0 ? void 0 : _d.authorization) || "";
        if (authHeader && typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
            finalToken = authHeader.slice(7).trim() || null;
        }
    }
    if (!finalToken)
        return null;
    try {
        const payload = jwt.verify(finalToken, JWT_SECRET);
        if (payload && typeof payload === "object" && typeof payload.adminId === "number") {
            return payload.adminId;
        }
        return null;
    }
    catch {
        return null;
    }
}
export function setAdminCookie(token, res) {
    const secureFlag = process.env.NODE_ENV === "production";
    const sameSite = secureFlag ? "none" : ADMIN_COOKIE_SAMESITE;
    const cookieValue = `${ADMIN_TOKEN_NAME}=${token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=${sameSite};${ADMIN_COOKIE_DOMAIN ? ` Domain=${ADMIN_COOKIE_DOMAIN};` : ""} HttpOnly`;
    if (res && typeof res.cookie === "function") {
        res.cookie(ADMIN_TOKEN_NAME, token, {
            httpOnly: true,
            secure: secureFlag,
            sameSite: sameSite,
            domain: ADMIN_COOKIE_DOMAIN,
            path: "/",
            maxAge: 60 * 60 * 24 * 7 * 1000,
        });
        return;
    }
    return cookieValue;
}
export function clearAdminCookie(res) {
    const secureFlag = process.env.NODE_ENV === "production";
    const sameSite = secureFlag ? "none" : ADMIN_COOKIE_SAMESITE;
    const cookieValue = `${ADMIN_TOKEN_NAME}=; Path=/; Max-Age=0; SameSite=${sameSite};${ADMIN_COOKIE_DOMAIN ? ` Domain=${ADMIN_COOKIE_DOMAIN};` : ""} HttpOnly`;
    if (res && typeof res.clearCookie === "function") {
        res.clearCookie(ADMIN_TOKEN_NAME, {
            httpOnly: true,
            secure: secureFlag,
            sameSite: sameSite,
            domain: ADMIN_COOKIE_DOMAIN,
            path: "/",
        });
        return;
    }
    return cookieValue;
}
//# sourceMappingURL=auth.js.map