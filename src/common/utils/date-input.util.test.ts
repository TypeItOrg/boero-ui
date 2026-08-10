import { formatDateInput, formatDisplayDate, parseDateInput } from "@common/utils/date-input.util";

describe("date input utilities", () => {
  it("parses an ISO date as a local calendar date", () => {
    expect(parseDateInput("2030-03-14")).toEqual(new Date(2030, 2, 14));
  });

  it("rejects invalid and incomplete ISO dates", () => {
    expect(parseDateInput("2030-02-30")).toBeUndefined();
    expect(parseDateInput("2030-02")).toBeUndefined();
    expect(parseDateInput(null)).toBeUndefined();
  });

  it("formats a local calendar date for form submission", () => {
    expect(formatDateInput(new Date(2030, 2, 14))).toBe("2030-03-14");
    expect(formatDateInput(undefined)).toBe("");
  });

  it("formats stored dates for display without changing invalid values", () => {
    expect(formatDisplayDate("2030-03-14")).toBe("14/03/2030");
    expect(formatDisplayDate(null, "Sin definir")).toBe("Sin definir");
    expect(formatDisplayDate("fecha desconocida")).toBe("fecha desconocida");
  });
});
