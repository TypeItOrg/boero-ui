import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { ActiveSession } from "@features/institutional-auth/types/active-session.types";

const SESSIONS_PAGE: PaginatedResponse<ActiveSession> = {
  items: [
    {
      sessionId: "session-1",
      ipAddress: "190.10.20.30",
      userAgent: "Mozilla/5.0",
      startedAt: "2026-08-21T10:00:00",
      currentSession: true,
    },
  ],
  page: 0,
  size: 20,
  totalItems: 1,
  totalPages: 1,
};

describe("fetchInstitutionalSessions", () => {
  type ServiceModule = typeof import("@features/institutional-auth/services/fetch-institutional-sessions.service");

  const institutionalApiFetchMock = jest.fn<Promise<Response>, [string]>();

  async function importService(): Promise<ServiceModule> {
    jest.doMock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
      institutionalApiFetch: institutionalApiFetchMock,
    }));

    return import("@features/institutional-auth/services/fetch-institutional-sessions.service");
  }

  beforeEach(() => {
    jest.resetModules();
    institutionalApiFetchMock.mockReset();
  });

  it("requests sessions with pagination and parses the response", async () => {
    institutionalApiFetchMock.mockResolvedValue(Response.json(SESSIONS_PAGE));
    const { fetchInstitutionalSessions } = await importService();

    await expect(fetchInstitutionalSessions({ page: 2, size: 50 })).resolves.toEqual(SESSIONS_PAGE);
    expect(institutionalApiFetchMock).toHaveBeenCalledWith("/api/v1/auth/sessions?page=2&size=50");
  });

  it("throws a descriptive error on backend failure", async () => {
    institutionalApiFetchMock.mockResolvedValue(Response.json({ message: "Boom" }, { status: 500 }));
    const { fetchInstitutionalSessions } = await importService();

    await expect(fetchInstitutionalSessions({ page: 0, size: 20 })).rejects.toThrow("Boom");
  });
});
