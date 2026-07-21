import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import {
  getInstitutionalHomeLinks,
  getInstitutionalHomeTasks,
} from "@features/institutional-auth/utils/institutional-home-access.util";

describe("institutional home access", () => {
  it("always includes the personal profile", () => {
    const links = getInstitutionalHomeLinks({ permissions: [] });

    expect(links.map(({ href }) => href)).toEqual(["/profile"]);
  });

  it("includes only the management capabilities granted to the user", () => {
    const links = getInstitutionalHomeLinks({
      permissions: [
        INSTITUTIONAL_PERMISSION.INSTITUTION_READ,
        INSTITUTIONAL_PERMISSION.PERSON_READ_ANY,
        INSTITUTIONAL_PERMISSION.ROLE_READ,
      ],
    });

    expect(links.map(({ href }) => href)).toEqual(["/profile", "/institution", "/people", "/roles"]);
  });

  it("keeps creation tasks separate from navigation links", () => {
    const tasks = getInstitutionalHomeTasks({ permissions: [INSTITUTIONAL_PERMISSION.PERSON_CREATE] });

    expect(tasks.map(({ href }) => href)).toEqual(["/people/new"]);
  });
});
