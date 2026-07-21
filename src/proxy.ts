import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { handleGuestOnlyRoute, handleProtectedRoute } from "@common/services/auth-proxy/auth-proxy.service";
import { RouteAccess, getRouteAccess } from "@common/services/auth-proxy/auth-proxy-route.util";
import { institutionalAuthProxyPolicy } from "@features/institutional-auth/utils/institutional-auth-proxy-policy.util";
import { platformAuthProxyPolicy } from "@features/platform-auth/utils/platform-auth-proxy-policy.util";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  switch (getRouteAccess(request.nextUrl.pathname)) {
    case RouteAccess.AdminGuestOnly:
      return handleGuestOnlyRoute(request, platformAuthProxyPolicy);
    case RouteAccess.AdminSession:
      return handleProtectedRoute(request, platformAuthProxyPolicy);
    case RouteAccess.InstitutionalGuestOnly:
      return handleGuestOnlyRoute(request, institutionalAuthProxyPolicy);
    case RouteAccess.InstitutionalSession:
      return handleProtectedRoute(request, institutionalAuthProxyPolicy);
    case RouteAccess.Public:
      return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
