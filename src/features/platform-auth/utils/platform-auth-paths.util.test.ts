import { getRedirectPath, getSafeNextPath } from "@features/platform-auth/utils/platform-auth-paths.util";

describe("platform-auth-paths.util", () => {
  it("returns the default path when next is empty or '/'", () => {
    expect(getSafeNextPath(undefined)).toBe("/admin");
    expect(getSafeNextPath(null)).toBe("/admin");
    expect(getSafeNextPath("")).toBe("/admin");
    expect(getSafeNextPath("/")).toBe("/admin");
    expect(getSafeNextPath("https://evil.com/")).toBe("/admin");
  });

  it("preserves safe relative paths", () => {
    expect(getSafeNextPath("/admin/orders?page=1")).toBe("/admin/orders?page=1");
  });

  it("rejects protocol-relative paths", () => {
    expect(getSafeNextPath("//evil.com")).toBe("/admin");
  });

  it("extracts path and search from absolute urls", () => {
    expect(getSafeNextPath("https://evil.com/a?b=1")).toBe("/a?b=1");
  });

  it("falls back when next is not a valid path", () => {
    expect(getSafeNextPath("not-a-path")).toBe("/admin");
  });

  it("builds redirect paths without next", () => {
    expect(getRedirectPath("/admin/auth/login")).toBe("/admin/auth/login");
  });

  it("encodes next in redirect paths", () => {
    expect(getRedirectPath("/admin/auth/login", "/admin?a=1")).toBe("/admin/auth/login?next=%2Fadmin%3Fa%3D1");
  });
});
