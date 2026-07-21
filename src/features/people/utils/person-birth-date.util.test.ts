import { getLatestAllowedBirthDate, hasMinimumPersonAge } from "@features/people/utils/person-birth-date.util";

describe("person birth date rules", () => {
  const today = new Date(2026, 6, 14);

  it("accepts the exact third birthday", () => {
    expect(hasMinimumPersonAge("2023-07-14", today)).toBe(true);
  });

  it("rejects a date one day short of the third birthday", () => {
    expect(hasMinimumPersonAge("2023-07-15", today)).toBe(false);
  });

  it("uses the last valid day when subtracting years from a leap day", () => {
    expect(getLatestAllowedBirthDate(new Date(2024, 1, 29))).toEqual(new Date(2021, 1, 28));
  });
});
