import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedHeaders = "Content-Type, Authorization";
const allowedMethods = "GET,POST,PUT,PATCH,DELETE,OPTIONS";

function isOriginAllowed(origin: string | null) {
  if (!origin) return true;
  if (!allowedOrigins.length) return true;
  return allowedOrigins.some((allowed) => {
    if (allowed.startsWith("*.")) {
      const domain = allowed.slice(1);
      return origin.endsWith(domain);
    }
    return allowed === origin;
  });
}

function withCorsHeaders(response: NextResponse, origin: string | null) {
  const allowOrigin =
    !origin && !allowedOrigins.length
      ? "*"
      : isOriginAllowed(origin)
        ? origin ?? allowedOrigins[0]
        : allowedOrigins[0];

  response.headers.set("Access-Control-Allow-Origin", allowOrigin || "*");
  response.headers.set("Access-Control-Allow-Methods", allowedMethods);
  response.headers.set("Access-Control-Allow-Headers", allowedHeaders);
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    // Use a plain 204 response for preflight, then add CORS headers
    const preflight = new NextResponse(null, { status: 204 });
    return withCorsHeaders(preflight, origin);
  }

  const response = NextResponse.next();
  return withCorsHeaders(response, origin);
}

export const config = {
  matcher: "/api/:path*",
};

