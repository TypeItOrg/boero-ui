import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import { filterActiveGuardianDependents, getGuardianDependentName } from "@features/guardian-dependents/utils/guardian-dependent-display.util";

function createDependent(overrides: Partial<GuardianDependent> = {}): GuardianDependent {
  return {
    personGuardianId: "link-1",
    dependentPersonId: "person-1",
    status: "ACTIVE",
    documentNumber: "54123456",
    firstName: "Mateo",
    lastName: "González",
    birthDate: "2018-09-10",
    relationship: "FATHER",
    isPrimaryContact: true,
    activeApplicationsCount: 0,
    roles: [],
    createdAt: "2026-09-24T12:00:00Z",
    ...overrides,
  };
}

describe("getGuardianDependentName", () => {
  it("joins the name when the API exposes it", () => {
    expect(getGuardianDependentName(createDependent())).toBe("Mateo González");
  });

  it("does not substitute the document for a missing name", () => {
    expect(getGuardianDependentName(createDependent({ firstName: null, lastName: null }))).toBe("");
  });
});

describe("filterActiveGuardianDependents", () => {
  it("keeps only approved links", () => {
    const active = createDependent({ personGuardianId: "a" });
    const dependents = [
      active,
      createDependent({ personGuardianId: "b", status: "PENDING" }),
      createDependent({ personGuardianId: "c", status: "REJECTED" }),
      createDependent({ personGuardianId: "d", status: "ENDED" }),
    ];

    expect(filterActiveGuardianDependents(dependents)).toEqual([active]);
  });
});
