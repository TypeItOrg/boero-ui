jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({ institutionalApiFetch: jest.fn() }));
jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({ requireInstitutionalUser: jest.fn() }));

import { revalidatePath } from "next/cache";

import { unlinkGuardianDependentAction } from "@features/guardian-dependents/actions/unlink-guardian-dependent.action";
import { GUARDIAN_DEPENDENTS_PAGE_PATH } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

const INSTITUTION_ID = "00000000-0000-4000-8000-000000000001";
const DEPENDENT_ID = "00000000-0000-4000-8000-0000000000b2";

describe("unlinkGuardianDependentAction", () => {
  const apiFetchMock = jest.mocked(institutionalApiFetch);

  beforeEach(() => {
    apiFetchMock.mockReset();
    jest.mocked(revalidatePath).mockReset();
    jest.mocked(requireInstitutionalUser).mockResolvedValue({
      userId: "user-id",
      personId: "person-id",
      name: "Carlos",
      lastName: "González",
      documentNumber: "35123456",
      institutionId: INSTITUTION_ID,
      roles: ["Tutor"],
      permissions: [INSTITUTIONAL_PERMISSION.GUARDIAN_DEPENDENT_MANAGE],
    });
  });

  it("unlinks the dependent and refreshes the dependents page", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const result = await unlinkGuardianDependentAction(INSTITUTION_ID, DEPENDENT_ID);

    expect(result).toEqual({ success: true });
    const [path, request] = apiFetchMock.mock.calls[0];
    expect(path).toBe(`/api/v1/institutions/${INSTITUTION_ID}/guardian/dependents/${DEPENDENT_ID}`);
    expect(request?.method).toBe("DELETE");
    expect(revalidatePath).toHaveBeenCalledWith(GUARDIAN_DEPENDENTS_PAGE_PATH);
  });

  it.each([
    ["institution", "not-a-uuid", DEPENDENT_ID],
    ["dependent", INSTITUTION_ID, "not-a-uuid"],
  ])("rejects a %s id that is not a UUID", async (_label, institutionId, dependentId) => {
    const result = await unlinkGuardianDependentAction(institutionId, dependentId);

    expect(result.error).toBeDefined();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("returns the backend error when the dependent is not linked", async () => {
    apiFetchMock.mockResolvedValue(Response.json({ status: 404, message: "No se encontró la persona a cargo especificada." }, { status: 404 }));

    const result = await unlinkGuardianDependentAction(INSTITUTION_ID, DEPENDENT_ID);

    expect(result).toEqual({ error: "No se encontró la persona a cargo especificada." });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
