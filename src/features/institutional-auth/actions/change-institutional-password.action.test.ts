jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
  institutionalApiFetch: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/fetch-institutional-person.service", () => ({
  fetchInstitutionalPerson: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn(),
}));

jest.mock("@features/institutional-auth/utils/institutional-auth-cookies.util", () => ({
  setInstitutionalPasswordChangedCookie: jest.fn(),
}));

jest.mock("@features/institutional-auth/actions/institutional-logout.action", () => ({
  logoutInstitutional: jest.fn(),
}));

import { changeInstitutionalPasswordAction } from "@features/institutional-auth/actions/change-institutional-password.action";
import { logoutInstitutional } from "@features/institutional-auth/actions/institutional-logout.action";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";
import { setInstitutionalPasswordChangedCookie } from "@features/institutional-auth/utils/institutional-auth-cookies.util";

const PERSON: InstitutionalPerson = {
  personId: "person-1",
  firstName: "Ana",
  lastName: "Pérez",
  documentNumber: "12345678",
  birthDate: "1995-05-15",
  phoneNumber: null,
  email: "ana@example.com",
  institutionId: "institution-1",
  institutionName: "Institución",
  address: {
    street: "San Martín",
    number: "123",
    floor: null,
    apartment: null,
    neighborhood: null,
    additionalInfo: null,
    city: { id: "city-1", name: "Rio Cuarto" },
  },
  birthCity: { id: "birth-city-1", name: "Rio Cuarto" },
  nationalityCountry: { id: "country-1", name: "Argentina" },
  deleted: false,
};

describe("changeInstitutionalPasswordAction", () => {
  const institutionalApiFetchMock = jest.mocked(institutionalApiFetch);
  const fetchInstitutionalPersonMock = jest.mocked(fetchInstitutionalPerson);
  const requireInstitutionalUserMock = jest.mocked(requireInstitutionalUser);
  const setPasswordChangedCookieMock = jest.mocked(setInstitutionalPasswordChangedCookie);
  const logoutInstitutionalMock = jest.mocked(logoutInstitutional);

  beforeEach(() => {
    institutionalApiFetchMock.mockReset();
    fetchInstitutionalPersonMock.mockReset();
    requireInstitutionalUserMock.mockReset();
    setPasswordChangedCookieMock.mockReset();
    logoutInstitutionalMock.mockReset();
    logoutInstitutionalMock.mockResolvedValue(undefined as never);
  });

  it("merges the stored person data, changes the password and forces logout", async () => {
    institutionalApiFetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    fetchInstitutionalPersonMock.mockResolvedValue(PERSON);

    await expect(changeInstitutionalPasswordAction({}, createFormData())).resolves.toEqual({ success: true });

    expect(JSON.parse(institutionalApiFetchMock.mock.calls[0][1]?.body as string)).toMatchObject({
      firstName: "Ana",
      lastName: "Pérez",
      birthDate: "1995-05-15",
      birthCityId: "birth-city-1",
      nationalityCountryId: "country-1",
      address: { street: "San Martín", number: "123", cityId: "city-1" },
      currentPassword: "old-password",
      password: "new-password",
    });
    expect(requireInstitutionalUserMock).toHaveBeenCalled();
    expect(setPasswordChangedCookieMock).toHaveBeenCalled();
    expect(logoutInstitutionalMock).toHaveBeenCalled();
  });

  it("validates before touching the backend", async () => {
    const result = await changeInstitutionalPasswordAction({}, createFormData({ currentPassword: "", confirmPassword: "other-password" }));

    expect("fieldErrors" in result ? result.fieldErrors : undefined).toEqual({
      currentPassword: "Ingresá tu contraseña actual.",
      confirmPassword: "Las contraseñas no coinciden.",
    });
    expect(institutionalApiFetchMock).not.toHaveBeenCalled();
    expect(requireInstitutionalUserMock).not.toHaveBeenCalled();
    expect(setPasswordChangedCookieMock).not.toHaveBeenCalled();
    expect(logoutInstitutionalMock).not.toHaveBeenCalled();
  });

  it("reports a missing person instead of calling the API", async () => {
    fetchInstitutionalPersonMock.mockResolvedValue(null);

    await expect(changeInstitutionalPasswordAction({}, createFormData())).resolves.toEqual({
      error: "No se pudieron obtener tus datos personales.",
    });
    expect(institutionalApiFetchMock).not.toHaveBeenCalled();
    expect(logoutInstitutionalMock).not.toHaveBeenCalled();
  });

  it("propagates backend field errors without setting the flash cookie", async () => {
    institutionalApiFetchMock.mockResolvedValue(Response.json({ message: "La contraseña actual es incorrecta." }, { status: 400 }));
    fetchInstitutionalPersonMock.mockResolvedValue(PERSON);

    await expect(changeInstitutionalPasswordAction({}, createFormData())).resolves.toEqual({
      error: "La contraseña actual es incorrecta.",
    });
    expect(setPasswordChangedCookieMock).not.toHaveBeenCalled();
  });
});

function createFormData(overrides: Partial<Record<"currentPassword" | "password" | "confirmPassword", string>> = {}): FormData {
  const values = {
    currentPassword: "old-password",
    password: "new-password",
    confirmPassword: "new-password",
    ...overrides,
  };

  const formData = new FormData();
  Object.entries(values).forEach(([field, value]) => formData.set(field, value));
  return formData;
}
