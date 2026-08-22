jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
  institutionalApiFetch: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn(),
}));

import { updateInstitutionalProfileAction } from "@features/institutional-auth/actions/update-institutional-profile.action";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";

describe("updateInstitutionalProfileAction", () => {
  const institutionalApiFetchMock = jest.mocked(institutionalApiFetch);
  const requireInstitutionalUserMock = jest.mocked(requireInstitutionalUser);

  beforeEach(() => {
    institutionalApiFetchMock.mockReset();
    requireInstitutionalUserMock.mockReset();
  });

  it("updates personal data without password fields", async () => {
    institutionalApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await expect(updateInstitutionalProfileAction(createFormData())).resolves.toEqual({ success: true });

    expect(JSON.parse(institutionalApiFetchMock.mock.calls[0][1]?.body as string)).not.toHaveProperty("password");
    expect(requireInstitutionalUserMock).toHaveBeenCalled();
  });

  it("rejects invalid input before calling the API", async () => {
    const result = await updateInstitutionalProfileAction(createFormData({ firstName: "Al" }));

    expect("fieldErrors" in result ? result.fieldErrors : undefined).toEqual({
      firstName: "El nombre debe tener al menos 3 caracteres.",
    });
    expect(institutionalApiFetchMock).not.toHaveBeenCalled();
  });
});

function createFormData(overrides: Partial<Record<"firstName" | "lastName" | "birthDate" | "email" | "phoneNumber", string>> = {}): FormData {
  const values = {
    firstName: "Matías",
    lastName: "Boero",
    birthDate: "1995-05-15",
    email: "matias@example.com",
    phoneNumber: "12345678",
    ...overrides,
  };

  const formData = new FormData();
  Object.entries(values).forEach(([field, value]) => formData.set(field, value));
  return formData;
}
