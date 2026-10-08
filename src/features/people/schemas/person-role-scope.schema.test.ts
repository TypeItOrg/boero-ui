import { personRoleAssignmentsSchema } from "@features/people/schemas/person-role.schema";

const roleId = "019e6d85-d070-7000-8000-000000000001";
const pathId = "019e6d85-d070-7000-8000-000000000002";

describe("role assignment scope", () => {
  it("requires explicit scope and rejects old roleIds payloads", () => {
    expect(personRoleAssignmentsSchema.safeParse([roleId]).success).toBe(false);
    expect(personRoleAssignmentsSchema.safeParse([{ roleId }]).success).toBe(false);
  });
  it("requires selected paths and forbids selections with institutional scope", () => {
    expect(personRoleAssignmentsSchema.safeParse([{ roleId, accessScope: "TRAINING_PATHS", trainingPathIds: [] }]).success).toBe(false);
    expect(personRoleAssignmentsSchema.safeParse([{ roleId, accessScope: "INSTITUTION", trainingPathIds: [pathId] }]).success).toBe(false);
    expect(personRoleAssignmentsSchema.safeParse([{ roleId, accessScope: "TRAINING_PATHS", trainingPathIds: [pathId] }]).success).toBe(true);
  });
  it("rejects duplicate paths and role assignments", () => {
    const assignment = { roleId, accessScope: "TRAINING_PATHS", trainingPathIds: [pathId] };
    expect(personRoleAssignmentsSchema.safeParse([assignment, assignment]).success).toBe(false);
    expect(personRoleAssignmentsSchema.safeParse([{ ...assignment, trainingPathIds: [pathId, pathId] }]).success).toBe(false);
  });
});
