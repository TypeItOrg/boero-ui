import { revalidatePath } from "next/cache";

import { updateInstitutionalProfileAction } from "@features/institutional-auth/actions/update-institutional-profile.action";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
  institutionalApiFetch: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn(),
}));

describe("updateInstitutionalProfileAction", () => {
  const institutionalApiFetchMock = jest.mocked(institutionalApiFetch);
  const requireInstitutionalUserMock = jest.mocked(requireInstitutionalUser);

  beforeEach(() => {
    institutionalApiFetchMock.mockReset();
    requireInstitutionalUserMock.mockReset();
  });

  it("updates personal data without password fields", async () => {
    institutionalApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    await expect(updateInstitutionalProfileAction(createFormData())).resolves.toEqual({
      success: true,
    });

    expect(institutionalApiFetchMock).toHaveBeenCalledWith("/api/v1/person/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: "Matías", lastName: "Boero", birthDate: "1995-05-15", email: "matias@example.com", phoneNumber: "12345678" }),
    });
    expect(JSON.parse(institutionalApiFetchMock.mock.calls[0][1]?.body as string)).not.toHaveProperty("password");
    expect(requireInstitutionalUserMock).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/account");
  });

  it("rejects invalid input before calling the API", async () => {
    const result = await updateInstitutionalProfileAction(createFormData({ firstName: "Al" }));

    expect("fieldErrors" in result ? result.fieldErrors : undefined).toEqual({
      firstName: "El nombre debe tener al menos 3 caracteres.",
    });
    expect(institutionalApiFetchMock).not.toHaveBeenCalled();
    expect(requireInstitutionalUserMock).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("does not report success or revalidate after a backend error", async () => {
    institutionalApiFetchMock.mockResolvedValue(Response.json({ message: "No se pudo actualizar el perfil." }, { status: 409 }));

    await expect(updateInstitutionalProfileAction(createFormData())).resolves.toEqual({ error: "No se pudo actualizar el perfil." });
    expect(revalidatePath).not.toHaveBeenCalled();
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
