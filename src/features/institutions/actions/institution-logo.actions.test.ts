jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@features/platform-auth/services/platform-api-fetch.service", () => ({ platformApiFetch: jest.fn() }));
jest.mock("@features/platform-auth/services/get-platform-account.service", () => ({ getPlatformAccount: jest.fn() }));
jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({ institutionalApiFetch: jest.fn() }));
jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({ getInstitutionalUser: jest.fn() }));
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { getPlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { getInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import {
  uploadPlatformInstitutionLogo,
  uploadInstitutionalInstitutionLogo,
  removePlatformInstitutionLogo,
  removeInstitutionalInstitutionLogo,
} from "@features/institutions/actions/institution-logo.actions";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
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
  jest
    .mocked(getPlatformAccount)
    .mockResolvedValue({ platformAccountId: "admin", name: "Admin", lastName: "Plataforma", email: "admin@example.com" });
  jest.mocked(getInstitutionalUser).mockResolvedValue(user);
  jest
    .mocked(platformApiFetch)
    .mockImplementation(async () => new Response(JSON.stringify({ logoUrl: `/api/v1/institutions/${institutionId}/logo?v=opaque1` })));
  jest
    .mocked(institutionalApiFetch)
    .mockImplementation(async () => new Response(JSON.stringify({ logoUrl: `/api/v1/institutions/${institutionId}/logo?v=opaque1` })));
});
it("[L01.platform-logo-lifecycle] uploads/replaces as multipart and deletes via platform transport", async () => {
  for (let replacement = 0; replacement < 2; replacement++) {
    expect((await uploadPlatformInstitutionLogo(institutionId, {}, image())).success).toBe(true);
  }
  expect(platformApiFetch).toHaveBeenCalledWith(
    `/api/v1/admin/institutions/${institutionId}/logo`,
    expect.objectContaining({ method: "PUT", body: expect.any(FormData) }),
  );
  jest.mocked(platformApiFetch).mockResolvedValueOnce(new Response(null, { status: 204 }));
  expect(await removePlatformInstitutionLogo(institutionId)).toEqual({ success: true, logoUrl: null });
  expect(platformApiFetch).toHaveBeenLastCalledWith(
    `/api/v1/admin/institutions/${institutionId}/logo`,
    expect.objectContaining({ method: "DELETE" }),
  );
});
it("[L02.institution-logo-lifecycle] uploads/replaces/removes only the current institution", async () => {
  for (let replacement = 0; replacement < 2; replacement++) {
    expect((await uploadInstitutionalInstitutionLogo(institutionId, {}, image())).success).toBe(true);
  }
  expect(institutionalApiFetch).toHaveBeenCalledWith(`/api/v1/institutions/${institutionId}/logo`, expect.objectContaining({ method: "PUT" }));
  jest.mocked(institutionalApiFetch).mockResolvedValueOnce(new Response(null, { status: 204 }));
  expect((await removeInstitutionalInstitutionLogo(institutionId)).success).toBe(true);
});
it("[L02.logo-authorization] rejects missing permission, wrong institution, tampered IDs and absent platform session", async () => {
  jest.mocked(getInstitutionalUser).mockResolvedValueOnce({ ...user, permissions: [] });
  expect((await uploadInstitutionalInstitutionLogo(institutionId, {}, image())).error).toMatch(/permiso/);
  expect((await removeInstitutionalInstitutionLogo("33333333-3333-4333-8333-333333333333")).error).toMatch(/permiso/);
  expect((await uploadPlatformInstitutionLogo("../evil", {}, image())).error).toBeDefined();
  jest.mocked(getPlatformAccount).mockResolvedValueOnce(null);
  expect((await removePlatformInstitutionLogo(institutionId)).error).toMatch(/permiso/);
  expect(institutionalApiFetch).not.toHaveBeenCalled();
  expect(platformApiFetch).not.toHaveBeenCalled();
});
it.each([
  ["image/svg+xml", 10],
  ["image/png", 0],
  ["image/png", 2 * 1024 * 1024 + 1],
])("[L03.real-image-validation] rejects unsupported MIME/empty/oversized file %s %s before transport", async (type, size) => {
  expect((await uploadPlatformInstitutionLogo(institutionId, {}, image(String(type), Number(size)))).fieldErrors?.file).toBeDefined();
  expect(platformApiFetch).not.toHaveBeenCalled();
});
it("[L03.replacement-failure] reports API and network errors without a replacement logo result", async () => {
  jest.mocked(platformApiFetch).mockRejectedValueOnce(new Error("offline"));
  const offline = await uploadPlatformInstitutionLogo(institutionId, {}, image());
  expect(offline.error).toMatch(/anterior se conserva/);
  expect(offline.logoUrl).toBeUndefined();
  jest.mocked(platformApiFetch).mockResolvedValueOnce(new Response(JSON.stringify({ message: "Imagen inválida" }), { status: 400 }));
  const invalid = await uploadPlatformInstitutionLogo(institutionId, {}, image());
  expect(invalid.error).toBe("Imagen inválida");
  expect(invalid.logoUrl).toBeUndefined();
});
