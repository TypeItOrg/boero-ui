import { INSTITUTIONAL_LOGIN_PATH } from "@features/institutional-auth/utils/institutional-auth-proxy-policy.util";
import { PLATFORM_LOGIN_PATH } from "@features/platform-auth/utils/platform-auth-proxy-policy.util";

const ADMIN_SESSION_ROOT_PATHS = ["/admin", "/api/admin"] as const;
const INSTITUTIONAL_PUBLIC_ROOT_PATHS = ["/auth/register", "/auth/password-recovery"] as const;

export enum RouteAccess {
  Public,
  AdminGuestOnly,
  AdminSession,
  InstitutionalGuestOnly,
  InstitutionalSession,
}

export function getRouteAccess(pathname: string): RouteAccess {
  if (pathname === PLATFORM_LOGIN_PATH) return RouteAccess.AdminGuestOnly;
  if (pathname === INSTITUTIONAL_LOGIN_PATH) return RouteAccess.InstitutionalGuestOnly;
  if (INSTITUTIONAL_PUBLIC_ROOT_PATHS.some((rootPath) => isPathWithinRoot(pathname, rootPath))) {
    return RouteAccess.Public;
  }
  if (ADMIN_SESSION_ROOT_PATHS.some((rootPath) => isPathWithinRoot(pathname, rootPath))) {
    return RouteAccess.AdminSession;
  }
  return RouteAccess.InstitutionalSession;
}

function isPathWithinRoot(pathname: string, rootPath: string): boolean {
  return pathname === rootPath || pathname.startsWith(`${rootPath}/`);
}
