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

  it("parses search, active filter and sort", () => {
    expect(
      parseInstitutionPaginationParams({
        page: "2",
        size: "30",
        search: "  boero  ",
        active: "true",
        sortField: "active",
        sortDirection: "desc",
      }),
    ).toEqual({
      page: 2,
      size: 30,
      search: "boero",
      active: true,
      sort: { field: "active", direction: "desc" },
    });

    expect(
      parseInstitutionPaginationParams({
        active: "false",
        sortField: "name",
        sortDirection: "desc",
      }),
    ).toMatchObject({
      active: false,
      sort: { field: "name", direction: "desc" },
    });
  });

  it("rejects unsupported active and sort values", () => {
    expect(
      parseInstitutionPaginationParams({
        active: "all",
        page: "-1",
        size: "999",
        sortField: "userCount",
        sortDirection: "desc",
      }),
    ).toMatchObject({
      page: 0,
      size: 10,
      active: undefined,
      sort: { field: "name", direction: "asc" },
    });
  });
});
