import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import { resolveGuardianWorkspaceDependent } from "@features/guardian-workspace/utils/resolve-guardian-workspace-dependent.util";

const DEPENDENTS: GuardianDependent[] = [
  {
    personGuardianId: "019f9c3a-f891-7bc5-a98d-e65332998001",
    dependentPersonId: "019f9c3a-f891-7bc5-a98d-e65332998002",
    documentNumber: "87654321",
    firstName: "Mateo",
    lastName: "González",
    birthDate: "2015-03-20",
    relationship: "FATHER",
    isPrimaryContact: true,
    activeApplicationsCount: 0,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

describe("resolveGuardianWorkspaceDependent", () => {
  it("resolves a dependent from the validated workspace id", () => {
    expect(resolveGuardianWorkspaceDependent(DEPENDENTS, "019f9c3a-f891-7bc5-a98d-e65332998002")).toBe(DEPENDENTS[0]);
  });

  it("does not select a dependent without an active workspace", () => {
    expect(resolveGuardianWorkspaceDependent(DEPENDENTS, undefined)).toBeUndefined();
  });

  it("does not select a dependent outside the tutor list", () => {
    expect(resolveGuardianWorkspaceDependent(DEPENDENTS, "019f9c3a-f891-7bc5-a98d-e65332998003")).toBeUndefined();
  });
});
