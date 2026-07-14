import { getRedirectPath, getSafeNextPath } from "@features/platform-auth/utils/platform-auth-paths.util";

describe("platform-auth-paths.util", () => {
  it("returns the default path when next is empty or '/'", () => {
    expect(getSafeNextPath(undefined)).toBe("/platform");
    expect(getSafeNextPath(null)).toBe("/platform");
    expect(getSafeNextPath("")).toBe("/platform");
    expect(getSafeNextPath("/")).toBe("/platform");
    expect(getSafeNextPath("https://evil.com/")).toBe("/platform");
  });

  it("preserves safe relative paths", () => {
    expect(getSafeNextPath("/platform/orders?page=1")).toBe("/platform/orders?page=1");
  });

  it("rejects protocol-relative paths", () => {
    expect(getSafeNextPath("//evil.com")).toBe("/platform");
  });

  it("extracts path and search from absolute urls", () => {
    expect(getSafeNextPath("https://evil.com/a?b=1")).toBe("/a?b=1");
  });

  it("falls back when next is not a valid path", () => {
    expect(getSafeNextPath("not-a-path")).toBe("/platform");
  });

  it("builds redirect paths without next", () => {
    expect(getRedirectPath("/auth/platform/login")).toBe("/auth/platform/login");
  });

  it("encodes next in redirect paths", () => {
    expect(getRedirectPath("/auth/platform/login", "/platform?a=1")).toBe(
      "/auth/platform/login?next=%2Fplatform%3Fa%3D1",
    );
  });
});
