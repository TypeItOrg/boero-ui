import { personRoleIdsSchema } from "./person-role.schema";
import { getRoleChanges } from "../utils/person-role-rules.util";

const ROLE_A = "019bffff-0000-7000-8000-000000000001";
const ROLE_B = "019bffff-0000-7000-8000-000000000002";
const ROLE_C = "019bffff-0000-7000-8000-000000000003";

describe("personRoleIdsSchema", () => {
  it("requires at least one role", () => {
    expect(personRoleIdsSchema.safeParse([]).success).toBe(false);
  });

  it("accepts unique role identifiers", () => {
    expect(personRoleIdsSchema.safeParse([ROLE_A, ROLE_B]).success).toBe(true);
  });

  it("rejects duplicate role identifiers", () => {
    expect(personRoleIdsSchema.safeParse([ROLE_A, ROLE_A]).success).toBe(false);
  });

  it("keeps regular assignments and revocations in the role delta", () => {
    expect(getRoleChanges([ROLE_A, ROLE_B], [ROLE_A, ROLE_C])).toEqual({
      assignments: [ROLE_C],
      revocations: [ROLE_B],
    });
  });
});
