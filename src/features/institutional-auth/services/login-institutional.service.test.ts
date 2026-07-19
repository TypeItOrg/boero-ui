import { loginInstitutionalAccount } from "@features/institutional-auth/services/login-institutional.service";

describe("loginInstitutionalAccount", () => {
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
  const originalApiUrl = process.env.BOERO_API_URL;

  beforeEach(() => {
    process.env.BOERO_API_URL = "https://api.example.test";
    global.fetch = fetchMock;
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    process.env.BOERO_API_URL = originalApiUrl;
  });

  it("posts the institution-scoped credentials", async () => {
    const payload = {
      user: {
        userId: "user-id",
        name: "Ada",
        lastName: "Lovelace",
        documentNumber: "12345678",
        institutionId: "institution-id",
        permissions: [],
      },
      tokens: { accessToken: "access-token", refreshToken: "refresh-token" },
    };
    const input = {
      institutionId: "institution-id",
      documentNumber: "12345678",
      password: "secret",
      rememberMe: true,
    };

    fetchMock.mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));

    await expect(loginInstitutionalAccount(input)).resolves.toEqual({ success: true, data: payload });
    expect(fetchMock).toHaveBeenCalledWith(new URL("/api/v1/auth/login", "https://api.example.test"), {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  });

  it("returns backend errors", async () => {
    const error = { status: 401, message: "Credenciales inválidas" };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(error), { status: 401 }));

    await expect(
      loginInstitutionalAccount({
        institutionId: "institution-id",
        documentNumber: "12345678",
        password: "secret",
        rememberMe: false,
      }),
    ).resolves.toEqual({ success: false, error });
  });

  it("returns a global error when the backend is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("network"));

    await expect(
      loginInstitutionalAccount({
        institutionId: "institution-id",
        documentNumber: "12345678",
        password: "secret",
        rememberMe: false,
      }),
    ).resolves.toEqual({ success: false, error: { status: 500, message: "No se pudo conectar con el servidor." } });
  });
});
