jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@features/platform-auth/services/platform-api-fetch.service", () => ({
  platformApiFetch: jest.fn(),
}));

import { revalidatePath } from "next/cache";

import { updatePlatformAccountAction } from "@features/platform-accounts/actions/update-platform-account.action";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

const ACCOUNT_ID = "00000000-0000-4000-8000-000000000003";

describe("updatePlatformAccountAction", () => {
  const platformApiFetchMock = jest.mocked(platformApiFetch);
  const revalidatePathMock = jest.mocked(revalidatePath);

  beforeEach(() => {
    platformApiFetchMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("omits the password when the fields are empty", async () => {
    platformApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await expect(updatePlatformAccountAction(ACCOUNT_ID, createFormData())).resolves.toEqual({ success: true });

    const [, request] = platformApiFetchMock.mock.calls[0];
    expect(JSON.parse(request?.body as string)).toEqual({
      name: "María",
      lastName: "González",
      email: "admin@boero.edu.ar",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(`/admin/accounts/${ACCOUNT_ID}`);
  });

  it("includes a new password when provided", async () => {
    platformApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await updatePlatformAccountAction(
      ACCOUNT_ID,
      createFormData({ password: "new-password", confirmPassword: "new-password" }),
    );

    const [, request] = platformApiFetchMock.mock.calls[0];
    expect(JSON.parse(request?.body as string)).toMatchObject({ password: "new-password" });
  });

  it("returns validation errors before calling the API", async () => {
    const result = await updatePlatformAccountAction(
      ACCOUNT_ID,
      createFormData({ password: "short", confirmPassword: "different" }),
    );

    expect(result.fieldErrors).toMatchObject({
      password: "La contraseña debe tener al menos 8 caracteres.",
      confirmPassword: "Las contraseñas no coinciden.",
    });
    expect(platformApiFetchMock).not.toHaveBeenCalled();
  });
});

function createFormData(
  overrides: Partial<Record<"name" | "lastName" | "email" | "password" | "confirmPassword", string>> = {},
): FormData {
  const values = {
    name: "María",
    lastName: "González",
    email: "admin@boero.edu.ar",
    password: "",
    confirmPassword: "",
    ...overrides,
  };
  const formData = new FormData();
  Object.entries(values).forEach(([field, value]) => formData.set(field, value));
  return formData;
}
