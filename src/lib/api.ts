const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";

export const API_BASE_URL = rawApiBase;

/**
 * Joins the configured API base URL (if provided) with a path.
 * Falls back to the relative path so the app still works when the
 * frontend and backend are deployed together.
 */
export function apiUrl(path: string) {
    if (/^https?:\/\//i.test(path)) return path;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Thin wrapper around fetch that prefixes the API base URL when needed.
 */
export function apiFetch(input: string, init?: RequestInit) {
    const url = apiUrl(input);
    return fetch(url, init);
}
