import { personRoleCodesSchema } from "./person-role.schema";
import { getRoleCodesAfterAssignment } from "../utils/person-role-rules.util";

describe("personRoleCodesSchema", () => {
  it("requires at least one role", () => {
    expect(personRoleCodesSchema.safeParse([]).success).toBe(false);
  });

  it.each(["INSTITUTIONAL_AUTHORITY", "ADMINISTRATIVE", "TEACHER", "GUARDIAN", "STUDENT"] as const)(
    "rejects APPLICANT with %s",
    (role) => {
      expect(personRoleCodesSchema.safeParse(["APPLICANT", role]).success).toBe(false);
    },
  );

  it("allows compatible role combinations", () => {
    expect(personRoleCodesSchema.safeParse(["INSTITUTIONAL_AUTHORITY", "ADMINISTRATIVE", "TEACHER"]).success).toBe(
      true,
    );
  });

  it("replaces existing roles when assigning APPLICANT", () => {
    expect(getRoleCodesAfterAssignment(["STUDENT", "GUARDIAN"], "APPLICANT")).toEqual(["APPLICANT"]);
  });

  it("replaces APPLICANT when assigning another role", () => {
    expect(getRoleCodesAfterAssignment(["APPLICANT"], "ADMINISTRATIVE")).toEqual(["ADMINISTRATIVE"]);
  });
});
