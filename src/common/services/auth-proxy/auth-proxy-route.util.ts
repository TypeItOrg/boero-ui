import { INSTITUTIONAL_LOGIN_PATH } from "@features/institutional-auth/utils/institutional-auth-proxy-policy.util";
import { PLATFORM_LOGIN_PATH } from "@features/platform-auth/utils/platform-auth-proxy-policy.util";

export const HEALTH_PROBE_PATH = "/api/health";
export const INSTITUTIONAL_UNAVAILABLE_PATH = "/institutional-unavailable";

const ADMIN_SESSION_ROOT_PATHS = ["/admin", "/api/admin"] as const;
const INSTITUTIONAL_PUBLIC_ROOT_PATHS = [
  "/auth/register",
  "/auth/password-recovery",
  "/auth/email-verification",
  INSTITUTIONAL_UNAVAILABLE_PATH,
] as const;
const PUBLIC_API_PATHS = [
  /^\/api\/(?:institutions|countries|cities)\/?$/,
  /^\/api\/countries\/[^/]+\/provinces\/?$/,
  /^\/api\/provinces\/[^/]+\/cities\/?$/,
] as const;

// Compatibility for existing shared endpoints. New APIs select their session by namespace.
const LEGACY_SCOPED_API_PATHS = [
  /^\/api\/(?:enrollment-period-curriculum|role-training-path-options)\/?$/,
  /^\/api\/enrollment-applications\/[^/]+\/documents\/?$/,
  /^\/api\/enrollment-applications\/[^/]+\/attachments\/[^/]+\/content\/?$/,
] as const;

export enum RouteAccess {
  Public,
  HealthProbe,
  AdminGuestOnly,
  AdminSession,
  InstitutionalGuestOnly,
  InstitutionalSession,
}

export function getRouteAccess(pathname: string, searchParams?: URLSearchParams): RouteAccess {
  if (pathname === HEALTH_PROBE_PATH || pathname === `${HEALTH_PROBE_PATH}/`) {
    return RouteAccess.HealthProbe;
  }
  if (pathname === PLATFORM_LOGIN_PATH) {
    return RouteAccess.AdminGuestOnly;
  }
  if (pathname === INSTITUTIONAL_LOGIN_PATH) {
    return RouteAccess.InstitutionalGuestOnly;
  }
  if (INSTITUTIONAL_PUBLIC_ROOT_PATHS.some((rootPath) => isPathWithinRoot(pathname, rootPath))) {
    return RouteAccess.Public;
  }

  if (isPathWithinRoot(pathname, "/api/public") || PUBLIC_API_PATHS.some((pattern) => pattern.test(pathname))) {
    return RouteAccess.Public;
  }
  if (ADMIN_SESSION_ROOT_PATHS.some((rootPath) => isPathWithinRoot(pathname, rootPath))) {
    return RouteAccess.AdminSession;
  }
  if (searchParams?.get("scope") === "admin" && LEGACY_SCOPED_API_PATHS.some((pattern) => pattern.test(pathname))) {
    return RouteAccess.AdminSession;
  }

  return RouteAccess.InstitutionalSession;
}

function isPathWithinRoot(pathname: string, rootPath: string): boolean {
  return pathname === rootPath || pathname.startsWith(`${rootPath}/`);
}
