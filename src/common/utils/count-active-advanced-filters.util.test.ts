import { countActiveAdvancedFilters } from "@common/utils/count-active-advanced-filters.util";

describe("countActiveAdvancedFilters", () => {
  it("returns zero when nothing is active", () => {
    expect(
      countActiveAdvancedFilters({
        activeAdvancedCount: 0,
        advancedDateFilters: [],
        advancedSelectFilters: [{ defaultValue: "false", label: "Registros", name: "deleted", options: [], value: "false" }],
        advancedYearFilters: [],
      }),
    ).toBe(0);
  });

  it("counts custom filters plus diverged select, year and date filters", () => {
    expect(
      countActiveAdvancedFilters({
        activeAdvancedCount: 2,
        advancedDateFilters: [{ label: "Inicio", name: "startDate", value: "2035-01-01" }],
        advancedSelectFilters: [
          { defaultValue: "false", label: "Registros", name: "deleted", options: [], value: "true" },
          { defaultValue: "all", label: "Estado", name: "courseStatus", options: [], value: "all" },
        ],
        advancedYearFilters: [{ defaultValue: "all", label: "Año", maxYear: 2030, minYear: 2020, name: "year", value: "2027" }],
      }),
    ).toBe(5);
  });
});
