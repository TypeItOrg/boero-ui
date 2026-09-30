jest.mock("@features/guardian-dependents/services/guardian-dependent.service", () => ({
  fetchGuardianDependents: jest.fn(),
}));
jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn(),
}));
jest.mock("@features/guardian-workspace/utils/guardian-workspace-cookie.util", () => ({
  setGuardianWorkspaceId: jest.fn(),
}));

import { fetchGuardianDependents } from "@features/guardian-dependents/services/guardian-dependent.service";
import { setGuardianWorkspaceAction } from "@features/guardian-workspace/actions/set-guardian-workspace.action";
import { setGuardianWorkspaceId } from "@features/guardian-workspace/utils/guardian-workspace-cookie.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

const DEPENDENT_ID = "019f9c3a-f891-7bc5-a98d-e65332998002";
const INSTITUTION_ID = "019f9c3a-f891-7bc5-a98d-e65332998003";

describe("setGuardianWorkspaceAction", () => {
  beforeEach(() => {
    jest.mocked(requireInstitutionalUser).mockResolvedValue({
      userId: "019f9c3a-f891-7bc5-a98d-e65332998004",
      personId: "019f9c3a-f891-7bc5-a98d-e65332998005",
      name: "Ana",
      lastName: "Pérez",
      documentNumber: "12345678",
      institutionId: INSTITUTION_ID,
      roles: ["Tutor"],
      permissions: [INSTITUTIONAL_PERMISSION.GUARDIAN_DEPENDENT_MANAGE],
    });
    jest.mocked(fetchGuardianDependents).mockResolvedValue([
      {
        personGuardianId: "019f9c3a-f891-7bc5-a98d-e65332998006",
        dependentPersonId: DEPENDENT_ID,
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
    ]);
    jest.mocked(setGuardianWorkspaceId).mockResolvedValue();
  });

  it("rejects an invalid dependent id before loading the session", async () => {
    await expect(setGuardianWorkspaceAction("invalid")).resolves.toEqual({ error: expect.any(String) });
    expect(requireInstitutionalUser).not.toHaveBeenCalled();
  });

  it("rejects a dependent that does not belong to the tutor", async () => {
    await expect(setGuardianWorkspaceAction("019f9c3a-f891-7bc5-a98d-e65332998007")).resolves.toEqual({ error: expect.any(String) });
    expect(setGuardianWorkspaceId).not.toHaveBeenCalled();
  });

  it("persists a dependent that belongs to the tutor", async () => {
    await expect(setGuardianWorkspaceAction(DEPENDENT_ID)).resolves.toEqual({ success: true });
    expect(fetchGuardianDependents).toHaveBeenCalledWith(INSTITUTION_ID);
    expect(setGuardianWorkspaceId).toHaveBeenCalledWith(DEPENDENT_ID);
  });
});
