import { INSTITUTIONAL_LOGIN_PATH } from "@features/institutional-auth/utils/institutional-auth-proxy-policy.util";
import { PLATFORM_LOGIN_PATH } from "@features/platform-auth/utils/platform-auth-proxy-policy.util";

const ADMIN_ROOT_PATH = "/admin";
const INSTITUTIONAL_REGISTER_PATH = "/auth/register";

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
  if (pathname === INSTITUTIONAL_REGISTER_PATH) return RouteAccess.Public;
  if (pathname === ADMIN_ROOT_PATH || pathname.startsWith(`${ADMIN_ROOT_PATH}/`)) {
    return RouteAccess.AdminSession;
  }
  return RouteAccess.InstitutionalSession;
}
