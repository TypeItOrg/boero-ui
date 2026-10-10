import { revalidatePath } from "next/cache";

import { createGuardianDependentAction } from "@features/guardian-dependents/actions/create-guardian-dependent.action";
import { GUARDIAN_DEPENDENT_MESSAGES, GUARDIAN_DEPENDENTS_PAGE_PATH } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({ institutionalApiFetch: jest.fn() }));
jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({ requireInstitutionalUser: jest.fn() }));

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

const LINK_ID = "00000000-0000-4000-8000-0000000000aa";

function pdf(name = "partida.pdf"): File {
  return new File(["%PDF-1.4"], name, { type: "application/pdf" });
}

function createFormWithDocuments(...documents: File[]): FormData {
  const form = createForm();
  documents.forEach((document) => form.append("documents", document));

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

  it("uploads each supporting document to the new link after creating it", async () => {
    apiFetchMock
      .mockResolvedValueOnce(Response.json({ personGuardianId: LINK_ID }, { status: 201 }))
      .mockResolvedValue(Response.json({ id: "attachment-id" }, { status: 201 }));

    const result = await createGuardianDependentAction(INSTITUTION_ID, {}, createFormWithDocuments(pdf("a.pdf"), pdf("b.pdf")));

    expect(result).toEqual({ success: true });
    expect(apiFetchMock).toHaveBeenCalledTimes(3);
    const [path, request] = apiFetchMock.mock.calls[1];
    expect(path).toBe(`/api/v1/institutions/${INSTITUTION_ID}/guardian/dependents/${LINK_ID}/attachments`);
    expect(request?.method).toBe("POST");
    expect((request?.body as FormData).get("file")).toBeInstanceOf(File);
  });

  it("ignores the empty file a browser sends when no document was chosen", async () => {
    apiFetchMock.mockResolvedValue(Response.json({ personGuardianId: LINK_ID }, { status: 201 }));

    const result = await createGuardianDependentAction(
      INSTITUTION_ID,
      {},
      createFormWithDocuments(new File([], "", { type: "application/octet-stream" })),
    );

    expect(result).toEqual({ success: true });
    expect(apiFetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["too many", Array.from({ length: 6 }, (_, index) => pdf(`${index}.pdf`)), GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENT_TOO_MANY],
    [
      "too large",
      [new File([new Uint8Array(10 * 1024 * 1024 + 1)], "big.pdf", { type: "application/pdf" })],
      GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENT_TOO_LARGE,
    ],
    [
      "of an unsupported type",
      [new File(["x"], "virus.exe", { type: "application/x-msdownload" })],
      GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENT_INVALID_TYPE,
    ],
  ])("rejects documents that are %s before creating the link", async (_label, documents, message) => {
    const result = await createGuardianDependentAction(INSTITUTION_ID, {}, createFormWithDocuments(...documents));

    expect(result.fieldErrors?.documents).toBe(message);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("reports that the request was registered when a document cannot be uploaded", async () => {
    apiFetchMock
      .mockResolvedValueOnce(Response.json({ personGuardianId: LINK_ID }, { status: 201 }))
      .mockResolvedValueOnce(Response.json({ message: "boom" }, { status: 500 }));

    const result = await createGuardianDependentAction(INSTITUTION_ID, {}, createFormWithDocuments(pdf()));

    expect(result).toEqual({ error: GUARDIAN_DEPENDENT_MESSAGES.ATTACHMENTS_FAILED });
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
