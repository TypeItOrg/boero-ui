import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { INSTITUTIONAL_UNAVAILABLE_PATH, RouteAccess, getRouteAccess } from "@common/services/auth-proxy/auth-proxy-route.util";
import { handleGuestOnlyRoute, handleProtectedRoute } from "@common/services/auth-proxy/auth-proxy.service";
import { InstitutionalHostError } from "@common/services/institutional-host/institutional-host-error";
import {
  INSTITUTIONAL_HOST_HEADER,
  rebuildInstitutionalHostHeader,
  resolveRequestInstitution,
} from "@common/services/institutional-host/institutional-host.service";

import { institutionalAuthProxyPolicy } from "@features/institutional-auth/utils/institutional-auth-proxy-policy.util";
import { platformAuthProxyPolicy } from "@features/platform-auth/utils/platform-auth-proxy-policy.util";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // Never accept a client-provided internal tenant header, including on health probes.
  request.headers.delete(INSTITUTIONAL_HOST_HEADER);

  const routeAccess = getRouteAccess(request.nextUrl.pathname, request.nextUrl.searchParams);

  if (routeAccess === RouteAccess.HealthProbe) {
    return NextResponse.next({ request: { headers: new Headers(request.headers) } });
  }

  if (request.nextUrl.pathname === INSTITUTIONAL_UNAVAILABLE_PATH) {
    return NextResponse.next({ request: { headers: new Headers(request.headers) } });
  }

  try {
    rebuildInstitutionalHostHeader(request.headers, request.headers);

    const institution = await resolveRequestInstitution(request.headers);

    if (institution && (routeAccess === RouteAccess.AdminGuestOnly || routeAccess === RouteAccess.AdminSession)) {
      return NextResponse.redirect(institutionalAuthProxyPolicy.getLoginRedirect(request), {
        status: 303,
        headers: { "Cache-Control": "no-store" },
      });
    }
  } catch (error) {
    const status = error instanceof InstitutionalHostError ? error.status : 503;
    const message = error instanceof InstitutionalHostError ? error.message : "No se pudo consultar la institución. Intentá nuevamente.";

    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
    }

    const destination = new URL(INSTITUTIONAL_UNAVAILABLE_PATH, request.url);

    destination.searchParams.set("status", String(status));
    destination.searchParams.set("message", message);

    return NextResponse.rewrite(destination, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  }

  switch (routeAccess) {
    case RouteAccess.AdminGuestOnly:
      return handleGuestOnlyRoute(request, platformAuthProxyPolicy);
    case RouteAccess.AdminSession:
      return handleProtectedRoute(request, platformAuthProxyPolicy);
    case RouteAccess.InstitutionalGuestOnly:
      return handleGuestOnlyRoute(request, institutionalAuthProxyPolicy);
    case RouteAccess.InstitutionalSession:
      return handleProtectedRoute(request, institutionalAuthProxyPolicy);
    case RouteAccess.Public:
      return NextResponse.next({ request: { headers: new Headers(request.headers) } });
  }
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
