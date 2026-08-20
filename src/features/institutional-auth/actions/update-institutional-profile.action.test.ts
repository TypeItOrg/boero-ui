jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
  institutionalApiFetch: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn(),
}));

jest.mock("@features/institutional-auth/utils/institutional-auth-cookies.util", () => ({
  setInstitutionalPasswordChangedCookie: jest.fn(),
}));

import { updateInstitutionalProfileAction } from "@features/institutional-auth/actions/update-institutional-profile.action";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { setInstitutionalPasswordChangedCookie } from "@features/institutional-auth/utils/institutional-auth-cookies.util";

describe("updateInstitutionalProfileAction", () => {
  const institutionalApiFetchMock = jest.mocked(institutionalApiFetch);
  const requireInstitutionalUserMock = jest.mocked(requireInstitutionalUser);
  const setPasswordChangedCookieMock = jest.mocked(setInstitutionalPasswordChangedCookie);

  beforeEach(() => {
    institutionalApiFetchMock.mockReset();
    requireInstitutionalUserMock.mockReset();
    setPasswordChangedCookieMock.mockReset();
  });

  it("sends the current password with a new password", async () => {
    institutionalApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await expect(
      updateInstitutionalProfileAction(
        createFormData({
          currentPassword: "old-password",
          password: "new-password",
          confirmPassword: "new-password",
        }),
      ),
    ).resolves.toEqual({ success: true });

    const [, request] = institutionalApiFetchMock.mock.calls[0];
    expect(JSON.parse(request?.body as string)).toMatchObject({
      currentPassword: "old-password",
      password: "new-password",
    });
    expect(requireInstitutionalUserMock).toHaveBeenCalled();
    expect(setPasswordChangedCookieMock).toHaveBeenCalled();
  });

  it("requires the current password before calling the API", async () => {
    const result = await updateInstitutionalProfileAction(
      createFormData({ password: "new-password", confirmPassword: "new-password" }),
    );

    expect("fieldErrors" in result ? result.fieldErrors : undefined).toEqual({
      currentPassword: "Ingresá tu contraseña actual.",
    });
    expect(institutionalApiFetchMock).not.toHaveBeenCalled();
    expect(requireInstitutionalUserMock).not.toHaveBeenCalled();
    expect(setPasswordChangedCookieMock).not.toHaveBeenCalled();
  });
});

function createFormData(
  overrides: Partial<Record<"currentPassword" | "password" | "confirmPassword", string>> = {},
): FormData {
  const values = {
    firstName: "Matías",
    lastName: "Boero",
    birthDate: "1995-05-15",
    email: "matias@example.com",
    phoneNumber: "12345678",
    currentPassword: "",
    password: "",
    confirmPassword: "",
    ...overrides,
  };

  const formData = new FormData();
  Object.entries(values).forEach(([field, value]) => formData.set(field, value));
  return formData;
}
