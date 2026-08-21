import type { AssignableRole } from "@features/people/types/assignable-role.types";
import { PeopleScope } from "@features/people/utils/people-scope.util";

const ASSIGNABLE_ROLES: AssignableRole[] = [{ id: "role-1", name: "Docente", technicalCode: "TEACHER" }];

describe("fetchSystemRoles", () => {
  type ServiceModule = typeof import("@features/people/services/fetch-system-roles.service");

  const peopleApiFetchMock = jest.fn<Promise<Response>, [PeopleScope, string]>();

  async function importService(): Promise<ServiceModule> {
    jest.doMock("@features/people/services/people-api-fetch.service", () => ({
      peopleApiFetch: peopleApiFetchMock,
    }));

    return import("@features/people/services/fetch-system-roles.service");
  }

  beforeEach(() => {
    jest.resetModules();
    peopleApiFetchMock.mockReset();
  });

  it("extracts roles from the institutional paginated response", async () => {
    peopleApiFetchMock.mockResolvedValue(Response.json({ items: ASSIGNABLE_ROLES, page: 0, size: 50, totalItems: 1, totalPages: 1 }));
    const { fetchSystemRoles } = await importService();

    await expect(fetchSystemRoles("institution-1", PeopleScope.INSTITUTIONAL)).resolves.toEqual(ASSIGNABLE_ROLES);
    expect(peopleApiFetchMock).toHaveBeenCalledWith(PeopleScope.INSTITUTIONAL, "/api/v1/institutions/institution-1/roles?size=50");
  });

  it("preserves the platform role-array response", async () => {
    peopleApiFetchMock.mockResolvedValue(Response.json(ASSIGNABLE_ROLES));
    const { fetchSystemRoles } = await importService();

    await expect(fetchSystemRoles("institution-1", PeopleScope.ADMIN)).resolves.toEqual(ASSIGNABLE_ROLES);
    expect(peopleApiFetchMock).toHaveBeenCalledWith(PeopleScope.ADMIN, "/api/v1/admin/institutions/institution-1/roles");
  });
});
