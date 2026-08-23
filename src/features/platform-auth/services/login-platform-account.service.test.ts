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
      loginPlatformAccount(
        {
          email: "user@example.com",
          password: "secret",
        },
        new Headers({ "user-agent": "Mozilla/5.0", "x-forwarded-for": "203.0.113.20" }),
      ),
    ).resolves.toEqual({ success: true, data: payload });

    expect(fetchMock).toHaveBeenCalledWith(new URL("/api/v1/admin/auth/login", "https://api.example.test"), {
      body: JSON.stringify({
        email: "user@example.com",
        password: "secret",
      }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
        "X-Forwarded-For": "203.0.113.20",
        "X-Real-IP": "203.0.113.20",
      },
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
      loginPlatformAccount(
        {
          email: "user@example.com",
          password: "secret",
        },
        new Headers(),
      ),
    ).resolves.toEqual({ success: false, error: backendError });
  });
});
