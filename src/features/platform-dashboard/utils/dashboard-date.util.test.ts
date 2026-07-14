import { formatDashboardDate } from "@features/platform-dashboard/utils/dashboard-date.util";

describe("formatDashboardDate", () => {
  it("formats an ISO date as dd/mm/yyyy", () => {
    expect(formatDashboardDate("2026-07-03T14:30:00")).toBe("03/07/2026");
  });

  it("preserves an unsupported value", () => {
    expect(formatDashboardDate("fecha desconocida")).toBe("fecha desconocida");
  });
});
