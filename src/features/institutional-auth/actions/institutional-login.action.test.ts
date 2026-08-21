jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/login-institutional.service", () => ({
  loginInstitutionalAccount: jest.fn(),
}));

jest.mock("@features/institutional-auth/utils/institutional-auth-cookies.util", () => ({
  clearInstitutionalPasswordChangedCookie: jest.fn(),
  clearInstitutionalRegistrationSuccessCookie: jest.fn(),
  setInstitutionalAuthCookies: jest.fn(),
}));

import { redirect } from "next/navigation";

import { loginInstitutionalAccount } from "@features/institutional-auth/services/login-institutional.service";
import {
  clearInstitutionalPasswordChangedCookie,
  clearInstitutionalRegistrationSuccessCookie,
  setInstitutionalAuthCookies,
} from "@features/institutional-auth/utils/institutional-auth-cookies.util";
import { loginInstitutional } from "@features/institutional-auth/actions/institutional-login.action";

type LoginFormInput = {
  institutionId?: string;
  documentNumber?: string;
  password?: string;
  rememberMe?: boolean;
};

function createLoginFormData(input: LoginFormInput = {}): FormData {
  const formData = new FormData();

  if (input.institutionId) formData.set("institutionId", input.institutionId);
  if (input.documentNumber) formData.set("documentNumber", input.documentNumber);
  if (input.password) formData.set("password", input.password);
  if (input.rememberMe) formData.set("rememberMe", "on");

  return formData;
}

describe("loginInstitutional", () => {
  const loginMock = jest.mocked(loginInstitutionalAccount);
  const clearPasswordChangedCookieMock = jest.mocked(clearInstitutionalPasswordChangedCookie);
  const clearRegistrationCookieMock = jest.mocked(clearInstitutionalRegistrationSuccessCookie);
  const setCookiesMock = jest.mocked(setInstitutionalAuthCookies);
  const redirectMock = jest.mocked(redirect);

  beforeEach(() => {
    loginMock.mockReset();
    clearPasswordChangedCookieMock.mockReset();
    clearRegistrationCookieMock.mockReset();
    setCookiesMock.mockReset();
    redirectMock.mockReset();
  });

  it("validates institution, document, and password before calling the backend", async () => {
    await expect(loginInstitutional({}, createLoginFormData())).resolves.toEqual({
      fieldErrors: {
        institutionId: "Seleccioná una institución.",
        documentNumber: "El documento es requerido.",
        password: "La contraseña es requerida.",
      },
    });
    expect(loginMock).not.toHaveBeenCalled();
    expect(clearRegistrationCookieMock).toHaveBeenCalled();
    expect(clearPasswordChangedCookieMock).toHaveBeenCalled();
  });

  it("returns backend field and global errors", async () => {
    loginMock.mockResolvedValueOnce({
      success: false,
      error: {
        status: 400,
        message: "Datos inválidos",
        fieldErrors: { institutionId: "Institución inválida", ignored: "ignored" },
      },
    });

    await expect(
      loginInstitutional({}, createLoginFormData({ institutionId: "institution-id", documentNumber: "12345678", password: "secret" })),
    ).resolves.toEqual({ fieldErrors: { institutionId: "Institución inválida" } });

    loginMock.mockResolvedValueOnce({
      success: false,
      error: { status: 401, message: "Credenciales inválidas" },
    });

    await expect(
      loginInstitutional({}, createLoginFormData({ institutionId: "institution-id", documentNumber: "12345678", password: "secret" })),
    ).resolves.toEqual({ error: "Credenciales inválidas" });
  });

  it("sets cookies and redirects to the institutional home", async () => {
    const tokens = { accessToken: "access-token", refreshToken: "refresh-token" };
    loginMock.mockResolvedValue({
      success: true,
      data: {
        user: {
          userId: "user-id",
          name: "Ada",
          lastName: "Lovelace",
          documentNumber: "12345678",
          institutionId: "institution-id",
          roles: [],
          permissions: [],
        },
        tokens,
      },
    });

    await loginInstitutional(
      {},
      createLoginFormData({
        institutionId: "institution-id",
        documentNumber: "12345678",
        password: "secret",
        rememberMe: true,
      }),
    );

    expect(setCookiesMock).toHaveBeenCalledWith(tokens, true);
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});
