export function normalizeImageUrl(url) {
    const placeholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' fill='%23e2e8f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='18'>N</text></svg>`;
    const placeholder = `data:image/svg+xml;utf8,${placeholderSvg}`;
    if (!url)
        return placeholder;
    if (/^data:/i.test(url))
        return url;
    // Handle external URLs - return as-is
    if (/^https?:\/\//i.test(url))
        return url;
    // If starts with slash, assume it's a public path - return as-is for both SSR and client
    if (url.startsWith("/")) {
        return url;
    }
    // If it looks like a filename with a common image extension, prefix with slash
    if (/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url)) {
        return "/" + url.replace(/^\/+/, "");
    }
    // Not a recognizable image URL — return placeholder to avoid 404s
    return placeholder;
}
export const placeholderImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='100%' height='100%' fill='%23e2e8f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='18'>N</text></svg>";
//# sourceMappingURL=images.js.map