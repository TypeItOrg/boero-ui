import { formatDashboardMonth } from "@features/platform-dashboard/utils/dashboard-month.util";

describe("formatDashboardMonth", () => {
  it("formats a compact Spanish month label", () => {
    expect(formatDashboardMonth({ year: 2025, month: 8 }, "short")).toBe("ago 25");
  });

  it("formats a complete Spanish month label", () => {
    expect(formatDashboardMonth({ year: 2026, month: 7 }, "long")).toBe("julio de 2026");
  });

  it("falls back to the year for an invalid month", () => {
    expect(formatDashboardMonth({ year: 2026, month: 13 }, "long")).toBe("2026");
  });
});
