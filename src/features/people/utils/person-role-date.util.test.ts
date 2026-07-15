import { formatRoleAssignedAt } from "./person-role-date.util";

describe("formatRoleAssignedAt", () => {
  it("formats UTC timestamps in the Buenos Aires timezone", () => {
    expect(formatRoleAssignedAt("2026-07-08T23:40:00Z")).toBe("08/07/2026, 20:40");
  });
});
