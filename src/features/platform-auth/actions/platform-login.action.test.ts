jest.mock("@features/platform-auth/services/login-platform-account.service", () => ({
  loginPlatformAccount: jest.fn(),
}));

jest.mock("@features/platform-auth/utils/platform-auth-cookies.util", () => ({
  setPlatformAuthCookies: jest.fn(),
}));

jest.mock("@features/platform-auth/utils/platform-auth-redirect.util", () => ({
  redirectToNext: jest.fn(),
}));

import { loginPlatformAccount } from "@features/platform-auth/services/login-platform-account.service";
import { setPlatformAuthCookies } from "@features/platform-auth/utils/platform-auth-cookies.util";
import { redirectToNext } from "@features/platform-auth/utils/platform-auth-redirect.util";
import { loginPlatform } from "@features/platform-auth/actions/platform-login.action";

type LoginFormInput = {
  email?: string;
  password?: string;
  next?: string;
};

function createLoginFormData(input: LoginFormInput = {}): FormData {
  const formData = new FormData();

  if (input.email) formData.set("email", input.email);
  if (input.password) formData.set("password", input.password);
  if (input.next) formData.set("next", input.next);

  return formData;
}

describe("loginPlatform", () => {
  const loginPlatformAccountMock = jest.mocked(loginPlatformAccount);
  const setPlatformAuthCookiesMock = jest.mocked(setPlatformAuthCookies);
  const redirectToNextMock = jest.mocked(redirectToNext);

  beforeEach(() => {
    loginPlatformAccountMock.mockReset();
    setPlatformAuthCookiesMock.mockReset();
    redirectToNextMock.mockReset();
  });

  it("returns schema field errors for invalid form data", async () => {
    await expect(loginPlatform({}, createLoginFormData())).resolves.toEqual({
      fieldErrors: {
        email: "Invalid input: expected string, received null",
        password: "Invalid input: expected string, received null",
      },
    });
    expect(loginPlatformAccountMock).not.toHaveBeenCalled();
  });

  it("returns backend field errors", async () => {
    loginPlatformAccountMock.mockResolvedValue({
      success: false,
      error: {
        status: 400,
        message: "Validation error",
        fieldErrors: {
          email: "Correo inválido",
          password: "Contraseña inválida",
          ignored: "ignored",
        },
      },
    });

    await expect(
      loginPlatform(
        {},
        createLoginFormData({
          email: "user@example.com",
          password: "secret",
        }),
      ),
    ).resolves.toEqual({
      fieldErrors: {
        email: "Correo inválido",
        password: "Contraseña inválida",
      },
    });
  });

  it("returns backend global errors", async () => {
    loginPlatformAccountMock.mockResolvedValue({
      success: false,
      error: {
        status: 401,
        message: "Credenciales inválidas",
      },
    });

    await expect(
      loginPlatform(
        {},
        createLoginFormData({
          email: "user@example.com",
          password: "secret",
        }),
      ),
    ).resolves.toEqual({
      error: "Credenciales inválidas",
    });
  });

  it("sets auth cookies and redirects on success", async () => {
    const tokens = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
    };

    loginPlatformAccountMock.mockResolvedValue({
      success: true,
      data: {
        account: {
          platformAccountId: "1",
          email: "user@example.com",
          name: "User",
          lastName: "Example",
        },
        tokens,
      },
    });

    await loginPlatform(
      {},
      createLoginFormData({
        email: "user@example.com",
        password: "secret",
        next: "/platform/orders",
      }),
    );

    expect(setPlatformAuthCookiesMock).toHaveBeenCalledWith(tokens);
    expect(redirectToNextMock).toHaveBeenCalledWith("/platform/orders");
  });
});
