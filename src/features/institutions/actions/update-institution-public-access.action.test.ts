jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@features/platform-auth/services/platform-api-fetch.service", () => ({ platformApiFetch: jest.fn() }));
jest.mock("@features/platform-auth/services/get-platform-account.service", () => ({
  getPlatformAccount: jest.fn(async () => ({ platformAccountId: "admin" })),
}));
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { getPlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { updateInstitutionPublicAccess } from "@features/institutions/actions/update-institution-public-access.action";
const id = "22222222-2222-4222-8222-222222222222";
function form(value?: string): FormData {
  const data = new FormData();
  if (value !== undefined) {
    data.set("publicSubdomain", value);
  }
  return data;
}
it.each(["cboero", ""])("[I01.legacy-update] platform updates optional independent public name %s without a slug field", async (value) => {
  jest.mocked(platformApiFetch).mockResolvedValue(new Response(null, { status: 204 }));
  expect(await updateInstitutionPublicAccess(id, {}, form(value))).toEqual({ success: true });
  expect(platformApiFetch).toHaveBeenCalledWith(
    `/api/v1/admin/institutions/${id}/public-access`,
    expect.objectContaining({ method: "PATCH", body: JSON.stringify({ publicSubdomain: value || null }) }),
  );
});
it.each([undefined, "Bad Name", "a.b", "-bad", "bad-", "a".repeat(64)])(
  "[I01.domain-invariant] rejects raw invalid public name %s",
  async (value) => {
    expect((await updateInstitutionPublicAccess(id, {}, form(value))).fieldErrors?.publicSubdomain).toBeDefined();
    expect(platformApiFetch).not.toHaveBeenCalled();
  },
);
it("[A03.payload-context] validates bound institution ID and platform authorization", async () => {
  expect((await updateInstitutionPublicAccess("../other", {}, form("cboero"))).error).toBeDefined();
  jest.mocked(getPlatformAccount).mockResolvedValueOnce(null);
  expect((await updateInstitutionPublicAccess(id, {}, form("cboero"))).error).toMatch(/permiso/);
  expect(platformApiFetch).not.toHaveBeenCalled();
});
it("[I01.legacy-update] returns named constraint or transport errors instead of success", async () => {
  jest.mocked(platformApiFetch).mockResolvedValueOnce(new Response(JSON.stringify({ message: "El nombre público ya está en uso" }), { status: 409 }));
  expect((await updateInstitutionPublicAccess(id, {}, form("cboero"))).error).toMatch(/en uso/);
  jest.mocked(platformApiFetch).mockRejectedValueOnce(new Error("offline"));
  expect((await updateInstitutionPublicAccess(id, {}, form("cboero"))).error).toBeDefined();
});
