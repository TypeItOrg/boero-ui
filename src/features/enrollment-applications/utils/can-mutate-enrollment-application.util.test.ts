jest.mock("@features/enrollment-applications/services/enrollment-application.service", () => ({
  fetchEnrollmentApplicationById: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn(),
}));

jest.mock("@features/guardian-workspace/utils/guardian-workspace-cookie.util", () => ({
  getGuardianWorkspaceId: jest.fn(),
}));

import { fetchEnrollmentApplicationById } from "@features/enrollment-applications/services/enrollment-application.service";
import { canMutateEnrollmentApplication } from "@features/enrollment-applications/utils/can-mutate-enrollment-application.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { getGuardianWorkspaceId } from "@features/guardian-workspace/utils/guardian-workspace-cookie.util";

const APPLICATION_ID = "00000000-0000-4000-8000-000000000001";
const ACTIVE_DEPENDENT_ID = "00000000-0000-4000-8000-000000000002";
const OTHER_DEPENDENT_ID = "00000000-0000-4000-8000-000000000003";

function institutionalUser(roles: string[]) {
  return {
    userId: "user-id",
    personId: "person-id",
    name: "Test",
    lastName: "User",
    documentNumber: "12345678",
    institutionId: "institution-id",
    roles,
    permissions: [],
  };
}

describe("canMutateEnrollmentApplication", () => {
  const fetchApplicationMock = jest.mocked(fetchEnrollmentApplicationById);
  const requireUserMock = jest.mocked(requireInstitutionalUser);
  const getWorkspaceIdMock = jest.mocked(getGuardianWorkspaceId);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows non-guardian users without workspace context", async () => {
    requireUserMock.mockResolvedValue(institutionalUser(["Postulante"]));

    await expect(canMutateEnrollmentApplication(APPLICATION_ID)).resolves.toBe(true);
    expect(getWorkspaceIdMock).not.toHaveBeenCalled();
    expect(fetchApplicationMock).not.toHaveBeenCalled();
  });

  it("rejects guardians without an active workspace", async () => {
    requireUserMock.mockResolvedValue(institutionalUser(["Tutor"]));
    getWorkspaceIdMock.mockResolvedValue(undefined);

    await expect(canMutateEnrollmentApplication(APPLICATION_ID)).resolves.toBe(false);
    expect(fetchApplicationMock).not.toHaveBeenCalled();
  });

  it("rejects an application outside the active workspace", async () => {
    requireUserMock.mockResolvedValue(institutionalUser(["Tutor"]));
    getWorkspaceIdMock.mockResolvedValue(ACTIVE_DEPENDENT_ID);
    fetchApplicationMock.mockResolvedValue({ personId: OTHER_DEPENDENT_ID } as Awaited<ReturnType<typeof fetchEnrollmentApplicationById>>);

    await expect(canMutateEnrollmentApplication(APPLICATION_ID)).resolves.toBe(false);
  });

  it("allows an application belonging to the active workspace", async () => {
    requireUserMock.mockResolvedValue(institutionalUser(["Tutor"]));
    getWorkspaceIdMock.mockResolvedValue(ACTIVE_DEPENDENT_ID);
    fetchApplicationMock.mockResolvedValue({ personId: ACTIVE_DEPENDENT_ID } as Awaited<ReturnType<typeof fetchEnrollmentApplicationById>>);

    await expect(canMutateEnrollmentApplication(APPLICATION_ID)).resolves.toBe(true);
  });
});
