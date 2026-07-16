const DEFAULT_REDIRECT_PATH = "/admin";

export function getSafeNextPath(next: string | null | undefined): string {
  if (!next || next === "/") return DEFAULT_REDIRECT_PATH;
  if (next.startsWith("/") && !next.startsWith("//")) return next;

  if (next.startsWith("http://") || next.startsWith("https://")) {
    try {
      const parsedUrl = new URL(next);
      const path = parsedUrl.pathname + parsedUrl.search;
      return path === "/" ? DEFAULT_REDIRECT_PATH : path;
    } catch {}
  }

  return DEFAULT_REDIRECT_PATH;
}

export function getRedirectPath(to: string, next?: string | null): string {
  if (!next) return to;
  return `${to}?next=${encodeURIComponent(next)}`;
}
