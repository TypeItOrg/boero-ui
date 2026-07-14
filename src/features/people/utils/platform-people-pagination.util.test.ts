import {
  DEFAULT_PLATFORM_PEOPLE_SORT,
  parsePlatformPeoplePaginationParams,
} from "@features/people/utils/platform-people-pagination.util";

describe("parsePlatformPeoplePaginationParams", () => {
  it("parses valid filters and sort", () => {
    expect(
      parsePlatformPeoplePaginationParams({
        institutionId: "22222222-2222-4222-8222-222222222222",
        page: "2",
        roleCode: "TEACHER",
        search: "  ana  ",
        size: "20",
        sortDirection: "desc",
        sortField: "institutionName",
      }),
    ).toEqual({
      institutionId: "22222222-2222-4222-8222-222222222222",
      page: 2,
      roleCode: "TEACHER",
      search: "ana",
      size: 20,
      sort: { field: "institutionName", direction: "desc" },
    });
  });

  it("ignores invalid filters and pagination values", () => {
    expect(
      parsePlatformPeoplePaginationParams({
        institutionId: "invalid",
        page: "-1",
        roleCode: "UNKNOWN",
        size: "30",
        sortDirection: "sideways",
        sortField: "email",
      }),
    ).toEqual({
      institutionId: undefined,
      page: 0,
      roleCode: undefined,
      search: "",
      size: 10,
      sort: DEFAULT_PLATFORM_PEOPLE_SORT,
    });
  });
});
