import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";

describe("revokePasskey", () => {
  type RevokePasskeyModule = typeof import("@features/institutional-auth/services/revoke-passkey.service");

  const apiFetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

  async function importService(): Promise<RevokePasskeyModule> {
    return import("@features/institutional-auth/services/revoke-passkey.service");
  }

  function jsonResponse(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status });
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

  it("requests re-authentication only for the backend code", async () => {
    apiFetchMock.mockResolvedValue(jsonResponse(403, { status: 403, message: "Requerido.", code: "RECENT_AUTHENTICATION_REQUIRED" }));

    const { revokePasskey } = await importService();

    await expect(revokePasskey("passkey-id")).rejects.toThrow("RECENT_AUTHENTICATION_REQUIRED");
  });

  it("keeps a generic error for 403 without the backend code", async () => {
    apiFetchMock.mockResolvedValue(jsonResponse(403, { status: 403, message: "Denegado." }));

    const { revokePasskey } = await importService();

    await expect(revokePasskey("passkey-id")).rejects.toThrow(INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_REVOKE_FAILED);
  });

  it("keeps a generic error for server failures", async () => {
    apiFetchMock.mockResolvedValue(jsonResponse(500, { status: 500, message: "Error." }));

    const { revokePasskey } = await importService();

    await expect(revokePasskey("passkey-id")).rejects.toThrow(INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_REVOKE_FAILED);
  });
});
