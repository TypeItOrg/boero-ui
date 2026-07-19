import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import {
  hasAllInstitutionalPermissions,
  hasAnyInstitutionalPermission,
  hasInstitutionalPermission,
} from "@features/institutional-auth/utils/institutional-permission.util";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

const user: InstitutionalUser = {
  userId: "user-id",
  personId: "person-id",
  name: "Ana",
  lastName: "García",
  documentNumber: "12345678",
  institutionId: "institution-id",
  permissions: [INSTITUTIONAL_PERMISSION.PERSON_READ_ANY, INSTITUTIONAL_PERMISSION.ROLE_ASSIGN],
};

describe("institutional permission helpers", () => {
  it("checks one permission", () => {
    expect(hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_READ_ANY)).toBe(true);
    expect(hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_DELETE)).toBe(false);
    expect(hasInstitutionalPermission(null, INSTITUTIONAL_PERMISSION.PERSON_READ_ANY)).toBe(false);
  });

  it("checks any and all permissions", () => {
    expect(
      hasAnyInstitutionalPermission(user, [
        INSTITUTIONAL_PERMISSION.PERSON_DELETE,
        INSTITUTIONAL_PERMISSION.ROLE_ASSIGN,
      ]),
    ).toBe(true);
    expect(
      hasAllInstitutionalPermissions(user, [
        INSTITUTIONAL_PERMISSION.PERSON_READ_ANY,
        INSTITUTIONAL_PERMISSION.ROLE_ASSIGN,
      ]),
    ).toBe(true);
    expect(
      hasAllInstitutionalPermissions(user, [
        INSTITUTIONAL_PERMISSION.PERSON_READ_ANY,
        INSTITUTIONAL_PERMISSION.PERSON_DELETE,
      ]),
    ).toBe(false);
  });
});
