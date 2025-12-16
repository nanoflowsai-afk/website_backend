var _a, _b;
const rawApiBase = (_b = (_a = process.env.NEXT_PUBLIC_API_BASE_URL) === null || _a === void 0 ? void 0 : _a.replace(/\/+$/, "")) !== null && _b !== void 0 ? _b : "";
export const API_BASE_URL = rawApiBase;
/**
 * Joins the configured API base URL (if provided) with a path.
 * Falls back to the relative path so the app still works when the
 * frontend and backend are deployed together.
 */
export function apiUrl(path) {
    if (/^https?:\/\//i.test(path))
        return path;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}
/**
 * Thin wrapper around fetch that prefixes the API base URL when needed.
 */
export function apiFetch(input, init) {
    const url = apiUrl(input);
    return fetch(url, init);
}
//# sourceMappingURL=api.js.map