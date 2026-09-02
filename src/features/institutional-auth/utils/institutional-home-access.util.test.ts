import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { getInstitutionalHomeLinks, getInstitutionalHomeTasks } from "@features/institutional-auth/utils/institutional-home-access.util";

describe("institutional home access", () => {
  it("always includes the personal profile", () => {
    const links = getInstitutionalHomeLinks({ permissions: [], roles: [] });

    expect(links.map(({ href }) => href)).toEqual(["/account"]);
  });

  it("includes only the management capabilities granted to the user", () => {
    const links = getInstitutionalHomeLinks({
      roles: [],
      permissions: [INSTITUTIONAL_PERMISSION.INSTITUTION_READ, INSTITUTIONAL_PERMISSION.PERSON_READ_ANY, INSTITUTIONAL_PERMISSION.ROLE_READ],
    });

    expect(links.map(({ href }) => href)).toEqual(["/account", "/institution", "/people", "/roles"]);
  });

  it("includes the enrollment link for applicants", () => {
    const links = getInstitutionalHomeLinks({ permissions: [], roles: ["Postulante"] });

    expect(links.map(({ href }) => href)).toEqual(["/account", "/enrollment-applications"]);
  });

  it("keeps creation tasks separate from navigation links", () => {
    const tasks = getInstitutionalHomeTasks({ permissions: [INSTITUTIONAL_PERMISSION.PERSON_CREATE], roles: [] });

    expect(tasks.map(({ href }) => href)).toEqual(["/people/new"]);
  });
});
