import { AcademicResource } from "@features/academic/types/academic-resource.types";
import {
  DEFAULT_ACADEMIC_YEAR_SORT,
  DEFAULT_TRAINING_PATH_SORT,
  getAcademicRegistrationSummary,
  parseAcademicPaginationParams,
} from "@features/academic/utils/academic-pagination.util";

describe("parseAcademicPaginationParams", () => {
  it("parses the academic table filters independently", () => {
    expect(
      parseAcademicPaginationParams({
        active: "false",
        deleted: "true",
        page: "2",
        search: " piano ",
        size: "20",
        startDate: "2026-03-01",
        status: "ACTIVE",
        type: "WORKSHOP",
        year: "2026",
      }),
    ).toMatchObject({
      active: false,
      deleted: true,
      page: 2,
      search: "piano",
      size: 20,
      startDate: "2026-03-01",
      status: "ACTIVE",
      type: "WORKSHOP",
      year: 2026,
    });
  });

  it("ignores unsupported filter and pagination values", () => {
    expect(
      parseAcademicPaginationParams({
        active: "maybe",
        endDate: "2026-02-30",
        page: "-1",
        size: "500",
        status: "UNKNOWN",
        type: "UNKNOWN",
        year: "1999",
      }),
    ).toMatchObject({
      active: undefined,
      endDate: undefined,
      page: 0,
      size: 10,
      status: undefined,
      type: undefined,
      year: undefined,
    });
  });

  it("parses supported academic year sort values and rejects unsupported fields", () => {
    expect(parseAcademicPaginationParams({}).sort).toEqual({ field: "year", direction: "asc" });

    expect(
      parseAcademicPaginationParams({
        sortDirection: "desc",
        sortField: "startDate",
      }).sort,
    ).toEqual({ field: "startDate", direction: "desc" });

    expect(
      parseAcademicPaginationParams({
        sortDirection: "asc",
        sortField: "status",
      }).sort,
    ).toEqual(DEFAULT_ACADEMIC_YEAR_SORT);
  });

  it("defaults training path sorting to name ascending", () => {
    expect(parseAcademicPaginationParams({}, AcademicResource.TRAINING_PATH).sort).toEqual(DEFAULT_TRAINING_PATH_SORT);

    expect(
      parseAcademicPaginationParams({ sortDirection: "desc", sortField: "name" }, AcademicResource.TRAINING_PATH).sort,
    ).toEqual({ field: "name", direction: "desc" });

    expect(
      parseAcademicPaginationParams({ sortDirection: "asc", sortField: "year" }, AcademicResource.TRAINING_PATH).sort,
    ).toEqual(DEFAULT_TRAINING_PATH_SORT);
  });

  it("uses singular and plural agreement in the registration summary", () => {
    expect(getAcademicRegistrationSummary(1, "ciclo lectivo", "ciclos lectivos")).toBe("1 ciclo lectivo registrado.");
    expect(getAcademicRegistrationSummary(2, "ciclo lectivo", "ciclos lectivos")).toBe(
      "2 ciclos lectivos registrados.",
    );
  });
});
