import {
  getEarliestMinorBirthDate,
  getLatestAdultBirthDate,
  getLatestAllowedBirthDate,
  hasMinimumPersonAge,
  isMinorBirthDate,
} from "@features/people/utils/person-birth-date.util";

describe("person birth date rules", () => {
  const today = new Date(2026, 6, 14);

  it("accepts the exact third birthday", () => {
    expect(hasMinimumPersonAge("2023-07-14", today)).toBe(true);
  });

  it("rejects a date one day short of the third birthday", () => {
    expect(hasMinimumPersonAge("2023-07-15", today)).toBe(false);
  });

  it("is a minor until the day before the eighteenth birthday", () => {
    expect(isMinorBirthDate("2008-07-15", today)).toBe(true);
  });

  it("is an adult on the exact eighteenth birthday", () => {
    expect(isMinorBirthDate("2008-07-14", today)).toBe(false);
  });

  it("uses the last valid day when subtracting years from a leap day", () => {
    expect(getLatestAllowedBirthDate(new Date(2024, 1, 29))).toEqual(new Date(2021, 1, 28));
  });

  it("returns the day after the eighteenth birthday as the earliest minor birth date", () => {
    expect(getEarliestMinorBirthDate(today)).toEqual(new Date(2008, 6, 15));
    expect(isMinorBirthDate("2008-07-15", today)).toBe(true);
    expect(isMinorBirthDate("2008-07-14", today)).toBe(false);
  });

  it("returns the eighteenth birthday as the latest adult birth date", () => {
    expect(getLatestAdultBirthDate(today)).toEqual(new Date(2008, 6, 14));
    expect(isMinorBirthDate("2008-07-14", today)).toBe(false);
  });
});
