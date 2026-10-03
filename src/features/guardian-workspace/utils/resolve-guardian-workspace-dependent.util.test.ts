import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import { resolveGuardianWorkspaceDependent } from "@features/guardian-workspace/utils/resolve-guardian-workspace-dependent.util";

const DEPENDENTS: GuardianDependent[] = [
  {
    personGuardianId: "019f9c3a-f891-7bc5-a98d-e65332998001",
    dependentPersonId: "019f9c3a-f891-7bc5-a98d-e65332998002",
    status: "ACTIVE",
    documentNumber: "87654321",
    firstName: "Mateo",
    lastName: "González",
    birthDate: "2015-03-20",
    relationship: "FATHER",
    isPrimaryContact: true,
    activeApplicationsCount: 0,
    roles: ["Postulante"],
    createdAt: "2026-01-01T00:00:00Z",
  },
];

describe("resolveGuardianWorkspaceDependent", () => {
  it("resolves a dependent from the validated workspace id", () => {
    expect(resolveGuardianWorkspaceDependent(DEPENDENTS, "019f9c3a-f891-7bc5-a98d-e65332998002")).toBe(DEPENDENTS[0]);
  });

  it("automatically selects the only dependent without an active workspace", () => {
    expect(resolveGuardianWorkspaceDependent(DEPENDENTS, undefined)).toBe(DEPENDENTS[0]);
  });

  it("automatically selects the only dependent when the workspace is no longer valid", () => {
    expect(resolveGuardianWorkspaceDependent(DEPENDENTS, "019f9c3a-f891-7bc5-a98d-e65332998003")).toBe(DEPENDENTS[0]);
  });

  it("does not automatically select when there are multiple dependents", () => {
    const multipleDependents = [...DEPENDENTS, { ...DEPENDENTS[0], dependentPersonId: "019f9c3a-f891-7bc5-a98d-e65332998004" }];

    expect(resolveGuardianWorkspaceDependent(multipleDependents, undefined)).toBeUndefined();
    expect(resolveGuardianWorkspaceDependent(multipleDependents, "019f9c3a-f891-7bc5-a98d-e65332998003")).toBeUndefined();
  });
});
