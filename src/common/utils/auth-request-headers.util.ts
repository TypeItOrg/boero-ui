export function createAuthRequestHeaders(requestHeaders: Pick<Headers, "get">): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientIp = requestHeaders.get("x-real-ip")?.trim() || forwardedFor;
  const userAgent = requestHeaders.get("user-agent")?.trim();

  if (clientIp) {
    headers["X-Forwarded-For"] = clientIp;
    headers["X-Real-IP"] = clientIp;
  }
  if (userAgent) headers["User-Agent"] = userAgent;

  return headers;
}
