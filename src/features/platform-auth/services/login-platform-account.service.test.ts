import { loginPlatformAccount } from "@features/platform-auth/services/login-platform-account.service";

describe("loginPlatformAccount", () => {
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

  it("posts login credentials and returns success payload", async () => {
    const payload = {
      account: {
        platformAccountId: "1",
        email: "user@example.com",
        name: "User",
        lastName: "Example",
      },
      tokens: {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      },
    };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(
      loginPlatformAccount({
        email: "user@example.com",
        password: "secret",
      }),
    ).resolves.toEqual({ success: true, data: payload });

    expect(fetchMock).toHaveBeenCalledWith(new URL("/api/v1/admin/auth/login", "https://api.example.test"), {
      body: JSON.stringify({
        email: "user@example.com",
        password: "secret",
      }),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  });

  it("returns backend errors when the response is not ok", async () => {
    const backendError = {
      status: 400,
      message: "Invalid credentials",
      fieldErrors: { email: "Correo inválido" },
    };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(backendError), {
        status: 400,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(
      loginPlatformAccount({
        email: "user@example.com",
        password: "secret",
      }),
    ).resolves.toEqual({ success: false, error: backendError });
  });
});
