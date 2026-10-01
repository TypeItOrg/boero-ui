import { DEFAULT_TEACHERS_SORT, parseTeachersPaginationParams } from "@features/people/utils/teachers-pagination.util";

describe("parseTeachersPaginationParams", () => {
  it("uses the default pagination and sort values", () => {
    expect(parseTeachersPaginationParams({})).toEqual({
      page: 0,
      size: 10,
      search: "",
      sort: DEFAULT_TEACHERS_SORT,
    });
  });

  it("keeps valid search, pagination and sort values", () => {
    expect(
      parseTeachersPaginationParams({
        page: "2",
        size: "50",
        search: "  garcia  ",
        sortField: "documentNumber",
        sortDirection: "desc",
      }),
    ).toEqual({
      page: 2,
      size: 50,
      search: "garcia",
      sort: { field: "documentNumber", direction: "desc" },
    });
  });
});
