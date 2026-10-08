import {
  getCurrentAcademicYear,
  getMaxAcademicYear,
  isAcademicYearInRange,
  parseAcademicYearFilter,
} from "@features/academic/utils/academic-year.util";

describe("academic year boundaries", () => {
  it.each([
    ["2027-01-01T02:59:59Z", 2026, 2027],
    ["2027-01-01T03:00:00Z", 2027, 2028],
  ])("uses the Argentine year at %s", (timestamp, current, maximum) => {
    const date = new Date(timestamp);

    expect(getCurrentAcademicYear(date)).toBe(current);
    expect(getMaxAcademicYear(date)).toBe(maximum);
    expect(isAcademicYearInRange(maximum, date)).toBe(true);
    expect(isAcademicYearInRange(maximum + 1, date)).toBe(false);
  });

  it.each([1999, 2026.5, Number.NaN, Number.POSITIVE_INFINITY])("rejects unsupported year %s", (year) => {
    expect(isAcademicYearInRange(year, new Date("2026-09-14T15:00:00Z"))).toBe(false);
  });

  it("validates filter values independently of the machine date", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-09-14T15:00:00Z"));

    try {
      expect(parseAcademicYearFilter("2000")).toBe(2000);
      expect(parseAcademicYearFilter("2027")).toBe(2027);
      expect(parseAcademicYearFilter("2028")).toBeUndefined();
      expect(parseAcademicYearFilter("26")).toBeUndefined();
      expect(parseAcademicYearFilter(["2026", "2027"])).toBeUndefined();
    } finally {
      jest.useRealTimers();
    }
  });
});
