import { getInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { uploadInstitutionalInstitutionLogo, removeInstitutionalInstitutionLogo } from "@features/institutions/actions/institution-logo.actions";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
  institutionalApiFetch: jest.fn(),
}));
jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  getInstitutionalUser: jest.fn(),
}));
const institutionId = "22222222-2222-4222-8222-222222222222";
const user = {
  userId: "user",
  name: "Ana",
  lastName: "Garcia",
  documentNumber: "12345678",
  institutionId,
  roles: [],
  permissions: [INSTITUTIONAL_PERMISSION.INSTITUTION_UPDATE],
};

function image(type = "image/png", size = 10): FormData {
  const form = new FormData();
  form.set("file", new File([new Uint8Array(size)], "logo.png", { type }));

  return form;
}

beforeEach(() => {
  jest.mocked(getInstitutionalUser).mockResolvedValue(user);
  jest
    .mocked(institutionalApiFetch)
    .mockImplementation(async () => new Response(JSON.stringify({ logoUrl: `/api/v1/institutions/${institutionId}/logo?v=opaque1` })));
});
it("[L02.institution-logo-lifecycle] uploads/replaces/removes only the current institution", async () => {
  for (let replacement = 0; replacement < 2; replacement++) {
    expect((await uploadInstitutionalInstitutionLogo(institutionId, {}, image())).success).toBe(true);
  }

  expect(institutionalApiFetch).toHaveBeenCalledWith(`/api/v1/institutions/${institutionId}/logo`, expect.objectContaining({ method: "PUT" }));
  jest.mocked(institutionalApiFetch).mockResolvedValueOnce(new Response(null, { status: 204 }));
  expect((await removeInstitutionalInstitutionLogo(institutionId)).success).toBe(true);
});
it("[L02.logo-authorization] rejects missing permission, wrong institution, tampered IDs and absent institutional session", async () => {
  jest.mocked(getInstitutionalUser).mockResolvedValueOnce({ ...user, permissions: [] });
  expect((await uploadInstitutionalInstitutionLogo(institutionId, {}, image())).error).toMatch(/permiso/);
  expect((await removeInstitutionalInstitutionLogo("33333333-3333-4333-8333-333333333333")).error).toMatch(/permiso/);
  expect((await uploadInstitutionalInstitutionLogo("../evil", {}, image())).error).toBeDefined();
  jest.mocked(getInstitutionalUser).mockResolvedValueOnce(null);
  expect((await removeInstitutionalInstitutionLogo(institutionId)).error).toMatch(/permiso/);
  expect(institutionalApiFetch).not.toHaveBeenCalled();
});
it.each([
  ["image/svg+xml", 10],
  ["image/png", 0],
  ["image/png", 2 * 1024 * 1024 + 1],
])("[L03.real-image-validation] rejects unsupported MIME/empty/oversized file %s %s before transport", async (type, size) => {
  expect((await uploadInstitutionalInstitutionLogo(institutionId, {}, image(String(type), Number(size)))).fieldErrors?.file).toBeDefined();
  expect(institutionalApiFetch).not.toHaveBeenCalled();
});
it("[L03.replacement-failure] reports API and network errors without a replacement logo result", async () => {
  jest.mocked(institutionalApiFetch).mockRejectedValueOnce(new Error("offline"));
  const offline = await uploadInstitutionalInstitutionLogo(institutionId, {}, image());
  expect(offline.error).toMatch(/anterior se conserva/);
  expect(offline.logoUrl).toBeUndefined();
  jest.mocked(institutionalApiFetch).mockResolvedValueOnce(new Response(JSON.stringify({ message: "Imagen inválida" }), { status: 400 }));
  const invalid = await uploadInstitutionalInstitutionLogo(institutionId, {}, image());
  expect(invalid.error).toBe("Imagen inválida");
  expect(invalid.logoUrl).toBeUndefined();
});
