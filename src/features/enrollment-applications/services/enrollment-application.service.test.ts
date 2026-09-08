import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { EnrollmentApplicationResponse } from "../types/enrollment-application.types";

const MOCK_APPLICATION: EnrollmentApplicationResponse = {
  applicationId: "app-456",
  institutionId: "inst-1",
  personId: "person-1",
  studyPlanId: "plan-1",
  academicYearId: "year-1",
  enrollmentPeriodId: "period-1",
  status: "SUBMITTED",
  isEditable: false,
  data: {},
  createdAt: "2026-03-01T10:00:00Z",
  updatedAt: "2026-03-01T10:00:00Z",
};

const MOCK_PAGE: PaginatedResponse<EnrollmentApplicationResponse> = {
  items: [MOCK_APPLICATION],
  page: 0,
  size: 10,
  totalItems: 1,
  totalPages: 1,
};

describe("enrollment-application.service administrative queries", () => {
  const institutionalApiFetchMock = jest.fn<Promise<Response>, [string, RequestInit?]>();

  async function importService() {
    jest.doMock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
      institutionalApiFetch: institutionalApiFetchMock,
    }));

    return import("./enrollment-application.service");
  }

  beforeEach(() => {
    jest.resetModules();
    institutionalApiFetchMock.mockReset();
  });

  describe("fetchEnrollmentApplications", () => {
    it("requests applications with query params and returns parsed response", async () => {
      institutionalApiFetchMock.mockResolvedValue(Response.json(MOCK_PAGE));
      const { fetchEnrollmentApplications } = await importService();

      const result = await fetchEnrollmentApplications({
        status: "SUBMITTED",
        enrollmentPeriodId: "period-123",
        search: "Pérez",
        page: 1,
        size: 20,
      });

      expect(institutionalApiFetchMock).toHaveBeenCalledWith(
        "/api/v1/enrollment-applications?enrollmentPeriodId=period-123&status=SUBMITTED&search=P%C3%A9rez&page=1&size=20",
        { method: "GET" },
      );
      expect(result).toEqual(MOCK_PAGE);
    });

    it("omits 'all' filter values from query parameters", async () => {
      institutionalApiFetchMock.mockResolvedValue(Response.json(MOCK_PAGE));
      const { fetchEnrollmentApplications } = await importService();

      await fetchEnrollmentApplications({
        status: "all",
        enrollmentPeriodId: "all",
      });

      expect(institutionalApiFetchMock).toHaveBeenCalledWith("/api/v1/enrollment-applications", { method: "GET" });
    });

    it("throws error when response is not ok", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "Error del servidor" }), { status: 500 }));
      const { fetchEnrollmentApplications } = await importService();

      await expect(fetchEnrollmentApplications()).rejects.toThrow("Error del servidor");
    });
  });

  describe("fetchEnrollmentApplicationById", () => {
    it("fetches single application by ID", async () => {
      institutionalApiFetchMock.mockResolvedValue(Response.json(MOCK_APPLICATION));
      const { fetchEnrollmentApplicationById } = await importService();

      const result = await fetchEnrollmentApplicationById("app-456");

      expect(institutionalApiFetchMock).toHaveBeenCalledWith("/api/v1/enrollment-applications/app-456", { method: "GET" });
      expect(result).toEqual(MOCK_APPLICATION);
    });

    it("throws error when application is not found or fails", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "No encontrada" }), { status: 404 }));
      const { fetchEnrollmentApplicationById } = await importService();

      await expect(fetchEnrollmentApplicationById("app-999")).rejects.toThrow("No encontrada");
    });
  });
});
