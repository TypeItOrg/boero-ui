import { isNavigationItemActive } from "./navigation.util";

describe("isNavigationItemActive", () => {
  it("matches a destination and its nested routes", () => {
    expect(isNavigationItemActive("/people", "/people")).toBe(true);
    expect(isNavigationItemActive("/people/123", "/people")).toBe(true);
  });

  it("does not match routes with a shared prefix", () => {
    expect(isNavigationItemActive("/people-archive", "/people")).toBe(false);
  });

  it("supports exact destinations", () => {
    expect(isNavigationItemActive("/admin", "/admin", true)).toBe(true);
    expect(isNavigationItemActive("/admin/roles", "/admin", true)).toBe(false);
  });
});
