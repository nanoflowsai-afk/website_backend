const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedHeaders = "Content-Type, Authorization";
const allowedMethods = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
function isOriginAllowed(origin) {
    if (!origin)
        return true;
    if (!allowedOrigins.length)
        return true;
    return allowedOrigins.some((allowed) => {
        if (allowed.startsWith("*.")) {
            const domain = allowed.slice(1);
            return origin.endsWith(domain);
        }
        return allowed === origin;
    });
}
export function expressCorsMiddleware(req, res, next) {
    var _a, _b;
    const origin = (_a = req.headers.origin) !== null && _a !== void 0 ? _a : null;
    const allowOrigin = !origin && !allowedOrigins.length
        ? "*"
        : isOriginAllowed(origin)
            ? (_b = origin) !== null && _b !== void 0 ? _b : allowedOrigins[0]
            : allowedOrigins[0];
    res.header("Access-Control-Allow-Origin", allowOrigin || "*");
    res.header("Access-Control-Allow-Methods", allowedMethods);
    res.header("Access-Control-Allow-Headers", allowedHeaders);
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
}
export default expressCorsMiddleware;
//# sourceMappingURL=middleware.js.map