import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { parseInstitutionalUser } from "@features/institutional-auth/schemas/institutional-user.schema";

describe("parseInstitutionalUser", () => {
  it("keeps known permissions and ignores unknown permissions", () => {
    const user = parseInstitutionalUser({
      user: {
        userId: "user-id",
        personId: "person-id",
        name: "Ana",
        lastName: "García",
        documentNumber: "12345678",
        institutionId: "institution-id",
        permissions: [INSTITUTIONAL_PERMISSION.PERSON_READ_ANY, "institution:future:permission"],
      },
    });

    expect(user?.permissions).toEqual([INSTITUTIONAL_PERMISSION.PERSON_READ_ANY]);
  });

  it("fails closed when the user payload is malformed", () => {
    expect(parseInstitutionalUser({ user: { userId: "user-id" } })).toBeNull();
  });
});
