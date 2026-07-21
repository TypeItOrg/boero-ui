import {
  DEFAULT_PLATFORM_ROLES_SORT,
  parsePlatformRolesPaginationParams,
} from "@features/roles/utils/platform-role-pagination.util";

describe("parsePlatformRolesPaginationParams", () => {
  it("parses valid filters and sort", () => {
    expect(
      parsePlatformRolesPaginationParams({
        institutionId: "22222222-2222-4222-8222-222222222222",
        page: "2",
        roleType: "CUSTOM",
        search: "  docentes  ",
        size: "20",
        sortDirection: "desc",
        sortField: "institutionName",
      }),
    ).toEqual({
      institutionId: "22222222-2222-4222-8222-222222222222",
      page: 2,
      roleType: "CUSTOM",
      search: "docentes",
      size: 20,
      sort: { field: "institutionName", direction: "desc" },
    });
  });

  it("uses defaults and ignores invalid filters", () => {
    expect(
      parsePlatformRolesPaginationParams({
        institutionId: "invalid",
        page: "-1",
        roleType: "UNKNOWN",
        size: "30",
        sortDirection: "sideways",
        sortField: "permissionCount",
      }),
    ).toEqual({
      institutionId: undefined,
      page: 0,
      roleType: undefined,
      search: "",
      size: 10,
      sort: DEFAULT_PLATFORM_ROLES_SORT,
    });
  });
});
