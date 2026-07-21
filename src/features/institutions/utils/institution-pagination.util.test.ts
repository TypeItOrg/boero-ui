import { parseInstitutionPaginationParams } from "@features/institutions/utils/institution-pagination.util";

describe("parseInstitutionPaginationParams", () => {
  it("uses defaults when query params are missing", () => {
    expect(parseInstitutionPaginationParams({})).toEqual({
      page: 0,
      size: 10,
      search: "",
      active: undefined,
      sort: { field: "name", direction: "asc" },
    });
  });

  it("parses valid page and size values", () => {
    expect(parseInstitutionPaginationParams({ page: "2", size: "10" })).toMatchObject({ page: 2, size: 10 });
    expect(parseInstitutionPaginationParams({ page: "2", size: "20" })).toMatchObject({ page: 2, size: 20 });
    expect(parseInstitutionPaginationParams({ page: "2", size: "30" })).toMatchObject({ page: 2, size: 30 });
    expect(parseInstitutionPaginationParams({ page: "2", size: "40" })).toMatchObject({ page: 2, size: 40 });
  });

  it("rejects invalid page values", () => {
    expect(parseInstitutionPaginationParams({ page: "-1", size: "10" })).toMatchObject({ page: 0, size: 10 });
    expect(parseInstitutionPaginationParams({ page: "abc", size: "10" })).toMatchObject({ page: 0, size: 10 });
  });

  it("rejects unsupported page sizes", () => {
    expect(parseInstitutionPaginationParams({ page: "1", size: "999" })).toMatchObject({ page: 1, size: 10 });
  });

  it("parses search, active filter and sort", () => {
    expect(
      parseInstitutionPaginationParams({
        search: "  boero  ",
        active: "true",
        sortField: "active",
        sortDirection: "desc",
      }),
    ).toEqual({
      page: 0,
      size: 10,
      search: "boero",
      active: true,
      sort: { field: "active", direction: "desc" },
    });

    expect(
      parseInstitutionPaginationParams({ active: "false", sortField: "name", sortDirection: "desc" }),
    ).toMatchObject({
      active: false,
      sort: { field: "name", direction: "desc" },
    });
  });

  it("rejects unsupported active and sort values", () => {
    expect(
      parseInstitutionPaginationParams({ active: "all", sortField: "userCount", sortDirection: "desc" }),
    ).toMatchObject({
      active: undefined,
      sort: { field: "name", direction: "asc" },
    });
  });
});
