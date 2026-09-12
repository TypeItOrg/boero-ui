import { getRouteAccess, RouteAccess } from "@common/services/auth-proxy/auth-proxy-route.util";
it.each(["/auth/email-verification", "/auth/email-verification/confirm"])("allows anonymous access to %s", (path) => {
  expect(getRouteAccess(path)).toBe(RouteAccess.Public);
});
it("does not broaden access to similarly named paths", () => {
  expect(getRouteAccess("/auth/email-verification-private")).toBe(RouteAccess.InstitutionalSession);
});
