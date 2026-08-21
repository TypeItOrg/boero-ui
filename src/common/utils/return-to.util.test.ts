import { appendReturnTo, getSafeReturnTo } from "@common/utils/return-to.util";

describe("return-to.util", () => {
  it("keeps safe internal paths", () => {
    expect(getSafeReturnTo("/roles?page=2", "/roles/role-1")).toBe("/roles?page=2");
  });

  it("falls back for external and malformed paths", () => {
    expect(getSafeReturnTo("//evil.example", "/roles/role-1")).toBe("/roles/role-1");
    expect(getSafeReturnTo("/\\evil.example", "/roles/role-1")).toBe("/roles/role-1");
    expect(getSafeReturnTo("https://evil.example/roles", "/roles/role-1")).toBe("/roles/role-1");
    expect(getSafeReturnTo(undefined, "/roles/role-1")).toBe("/roles/role-1");
  });

  it("encodes the return path in a destination", () => {
    expect(appendReturnTo("/roles/role-1/edit", "/roles?page=2")).toBe("/roles/role-1/edit?returnTo=%2Froles%3Fpage%3D2");
  });
});
