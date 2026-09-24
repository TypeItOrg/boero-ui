jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({ institutionalApiFetch: jest.fn() }));
jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({ requireInstitutionalUser: jest.fn() }));

import { revalidatePath } from "next/cache";

import { createGuardianDependentAction } from "@features/guardian-dependents/actions/create-guardian-dependent.action";
import { GUARDIAN_DEPENDENTS_PAGE_PATH } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

const INSTITUTION_ID = "00000000-0000-4000-8000-000000000001";

function createForm(overrides: Record<string, string> = {}): FormData {
  const data = {
    documentNumber: "54123456",
    firstName: "Mateo",
    lastName: "González",
    birthDate: "2018-09-10",
    relationship: "FATHER",
    isPrimaryContact: "true",
    ...overrides,
  };
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => form.set(key, value));

  return form;
}

function givenUser(overrides: { institutionId?: string; permissions?: string[] } = {}): void {
  jest.mocked(requireInstitutionalUser).mockResolvedValue({
    userId: "user-id",
    personId: "person-id",
    name: "Carlos",
    lastName: "González",
    documentNumber: "35123456",
    institutionId: overrides.institutionId ?? INSTITUTION_ID,
    roles: ["Tutor"],
    permissions: overrides.permissions ?? [INSTITUTIONAL_PERMISSION.GUARDIAN_DEPENDENT_MANAGE],
  });
}

describe("createGuardianDependentAction", () => {
  const apiFetchMock = jest.mocked(institutionalApiFetch);

  beforeEach(() => {
    apiFetchMock.mockReset();
    jest.mocked(revalidatePath).mockReset();
    givenUser();
  });

  it("links the dependent and refreshes the dependents page", async () => {
    apiFetchMock.mockResolvedValue(Response.json({ dependentPersonId: "dependent-id" }, { status: 201 }));

    const result = await createGuardianDependentAction(INSTITUTION_ID, {}, createForm());

    expect(result).toEqual({ success: true });
    const [path, request] = apiFetchMock.mock.calls[0];
    expect(path).toBe(`/api/v1/institutions/${INSTITUTION_ID}/guardian/dependents`);
    expect(request?.method).toBe("POST");
    expect(JSON.parse(String(request?.body))).toEqual({
      documentNumber: "54123456",
      firstName: "Mateo",
      lastName: "González",
      birthDate: "2018-09-10",
      relationship: "FATHER",
      isPrimaryContact: true,
    });
    expect(revalidatePath).toHaveBeenCalledWith(GUARDIAN_DEPENDENTS_PAGE_PATH);
  });

  it("returns field errors without calling the backend when the form is invalid", async () => {
    const result = await createGuardianDependentAction(INSTITUTION_ID, {}, createForm({ documentNumber: "123" }));

    expect(result.fieldErrors?.documentNumber).toBeDefined();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("rejects an institution id that is not a UUID", async () => {
    const result = await createGuardianDependentAction("not-a-uuid", {}, createForm());

    expect(result.error).toBeDefined();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["the user lacks the permission", { permissions: [] }],
    ["the institution is another one", { institutionId: "00000000-0000-4000-8000-000000000099" }],
  ])("does not call the backend when %s", async (_label, user) => {
    givenUser(user);

    const result = await createGuardianDependentAction(INSTITUTION_ID, {}, createForm());

    expect(result.error).toBeDefined();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("surfaces the backend business error", async () => {
    apiFetchMock.mockResolvedValue(
      Response.json(
        { status: 409, message: "Esa persona ya está registrada como persona a cargo tuya.", code: "DEPENDENT_ALREADY_LINKED" },
        { status: 409 },
      ),
    );

    const result = await createGuardianDependentAction(INSTITUTION_ID, {}, createForm());

    expect(result).toEqual({ error: "Esa persona ya está registrada como persona a cargo tuya." });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
