import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";

const INSTITUTION_ID = "00000000-0000-4000-8000-000000000001";

const DEPENDENT: GuardianDependent = {
  personGuardianId: "00000000-0000-4000-8000-0000000000a1",
  dependentPersonId: "00000000-0000-4000-8000-0000000000b2",
  documentNumber: "54123456",
  firstName: "Mateo",
  lastName: "González",
  birthDate: "2018-09-10",
  relationship: "FATHER",
  isPrimaryContact: true,
  activeApplicationsCount: 1,
  createdAt: "2026-09-24T12:00:00Z",
};

describe("guardian dependent service", () => {
  const institutionalApiFetchMock = jest.fn<Promise<Response>, [string, RequestInit?]>();

  async function importService() {
    jest.doMock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
      institutionalApiFetch: institutionalApiFetchMock,
    }));

    return import("@features/guardian-dependents/services/guardian-dependent.service");
  }

  beforeEach(() => {
    jest.resetModules();
    institutionalApiFetchMock.mockReset();
  });

  it("fetches the dependents of the authenticated guardian", async () => {
    institutionalApiFetchMock.mockResolvedValue(Response.json([DEPENDENT]));
    const { fetchGuardianDependents } = await importService();

    const result = await fetchGuardianDependents(INSTITUTION_ID);

    expect(institutionalApiFetchMock).toHaveBeenCalledWith(`/api/v1/institutions/${INSTITUTION_ID}/guardian/dependents`);
    expect(result).toEqual([DEPENDENT]);
  });

  it("throws an HttpResponseError when the backend rejects the request", async () => {
    institutionalApiFetchMock.mockResolvedValue(Response.json({ message: "Sin permisos" }, { status: 403 }));
    const { fetchGuardianDependents } = await importService();

    await expect(fetchGuardianDependents(INSTITUTION_ID)).rejects.toMatchObject({ status: 403, message: "Sin permisos" });
  });
});
