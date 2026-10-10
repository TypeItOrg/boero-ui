import { formatRoleAssignedAt } from "@features/people/utils/person-role-date.util";

describe("formatRoleAssignedAt", () => {
  it("formats UTC timestamps in the Buenos Aires timezone", () => {
    expect(formatRoleAssignedAt("2026-07-08T23:40:00Z")).toBe("08/07/2026, 20:40");
    expect(formatRoleAssignedAt("2026-07-09T01:00:00Z")).toBe("08/07/2026, 22:00");
  });

  it.each([undefined, ""])("reports a pending assignment for %s", (value) => {
    expect(formatRoleAssignedAt(value)).toBe("Asignación pendiente");
  });

  it("preserves an unreadable timestamp", () => {
    expect(formatRoleAssignedAt("fecha desconocida")).toBe("fecha desconocida");
  });
});
