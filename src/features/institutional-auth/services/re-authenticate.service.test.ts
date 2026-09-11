import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";

describe("reAuthenticate", () => {
  type ReAuthenticateModule = typeof import("@features/institutional-auth/services/re-authenticate.service");

  const apiFetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

  async function importService(): Promise<ReAuthenticateModule> {
    return import("@features/institutional-auth/services/re-authenticate.service");
  }

  beforeEach(() => {
    jest.resetModules();
    jest.doMock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
      institutionalApiFetch: apiFetchMock,
    }));
  });

  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("resolves when the password is verified", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const { reAuthenticate } = await importService();

    await expect(reAuthenticate("secret")).resolves.toBeUndefined();
  });

  it.each([
    [401, INSTITUTIONAL_AUTH_ERROR_MESSAGES.REAUTH_INVALID_PASSWORD],
    [429, INSTITUTIONAL_AUTH_ERROR_MESSAGES.REAUTH_RATE_LIMITED],
    [503, INSTITUTIONAL_AUTH_ERROR_MESSAGES.REAUTH_UNAVAILABLE],
    [500, INSTITUTIONAL_AUTH_ERROR_MESSAGES.REAUTH_UNAVAILABLE],
  ])("maps status %i to a specific message", async (status, message) => {
    apiFetchMock.mockResolvedValue(new Response(null, { status }));

    const { reAuthenticate } = await importService();

    await expect(reAuthenticate("secret")).rejects.toThrow(message);
  });

  it("maps network failures to a connection message", async () => {
    apiFetchMock.mockRejectedValue(new Error("network"));

    const { reAuthenticate } = await importService();

    await expect(reAuthenticate("secret")).rejects.toThrow(INSTITUTIONAL_AUTH_ERROR_MESSAGES.REAUTH_CONNECTION);
  });
});
