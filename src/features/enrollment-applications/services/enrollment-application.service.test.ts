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
        periodId: "period-123",
        search: "Pérez",
        page: 1,
        size: 20,
      });

      expect(institutionalApiFetchMock).toHaveBeenCalledWith(
        "/api/v1/enrollment-applications?periodId=period-123&status=SUBMITTED&search=P%C3%A9rez&page=1&size=20",
        { method: "GET" },
      );
      expect(result).toEqual(MOCK_PAGE);
    });

    it("omits 'all' filter values from query parameters", async () => {
      institutionalApiFetchMock.mockResolvedValue(Response.json(MOCK_PAGE));
      const { fetchEnrollmentApplications } = await importService();

      await fetchEnrollmentApplications({
        status: "all",
        periodId: "all",
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

  describe("submitEnrollmentApplication", () => {
    it("returns the parsed response when the backend confirms submission", async () => {
      institutionalApiFetchMock.mockResolvedValue(Response.json(MOCK_APPLICATION));
      const { submitEnrollmentApplication } = await importService();

      const result = await submitEnrollmentApplication("app-456");

      expect(result).toEqual(MOCK_APPLICATION);
    });

    it("propagates the error instead of fabricating a submitted response on 404", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "No encontrada" }), { status: 404 }));
      const { submitEnrollmentApplication } = await importService();

      await expect(submitEnrollmentApplication("app-456")).rejects.toThrow("No encontrada");
    });

    it("propagates the error instead of fabricating a submitted response on 405", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "Método no permitido" }), { status: 405 }));
      const { submitEnrollmentApplication } = await importService();

      await expect(submitEnrollmentApplication("app-456")).rejects.toThrow("Método no permitido");
    });

    it("propagates the error on a server failure", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "Error del servidor" }), { status: 500 }));
      const { submitEnrollmentApplication } = await importService();

      await expect(submitEnrollmentApplication("app-456")).rejects.toThrow("Error del servidor");
    });
  });

  describe("cancelEnrollmentApplication", () => {
    it("returns the parsed response when the backend confirms cancellation", async () => {
      institutionalApiFetchMock.mockResolvedValue(Response.json(MOCK_APPLICATION));
      const { cancelEnrollmentApplication } = await importService();

      const result = await cancelEnrollmentApplication("app-456");

      expect(result).toEqual(MOCK_APPLICATION);
    });

    it("propagates the error instead of fabricating a cancelled response on 404", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "No encontrada" }), { status: 404 }));
      const { cancelEnrollmentApplication } = await importService();

      await expect(cancelEnrollmentApplication("app-456")).rejects.toThrow("No encontrada");
    });

    it("propagates the error instead of fabricating a cancelled response on 405", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "Método no permitido" }), { status: 405 }));
      const { cancelEnrollmentApplication } = await importService();

      await expect(cancelEnrollmentApplication("app-456")).rejects.toThrow("Método no permitido");
    });
  });

  describe("uploadEnrollmentAttachment", () => {
    const file = new File(["contenido"], "dni.pdf", { type: "application/pdf" });

    it("returns the parsed attachment when the upload succeeds", async () => {
      const mockAttachment = {
        id: "att-1",
        documentType: "DNI_FRONT" as const,
        fileName: "dni.pdf",
        contentType: "application/pdf",
        fileSize: 9,
        uploadedAt: "2026-03-01T10:00:00Z",
      };
      institutionalApiFetchMock.mockResolvedValue(Response.json(mockAttachment));
      const { uploadEnrollmentAttachment } = await importService();

      const result = await uploadEnrollmentAttachment("app-456", "DNI_FRONT", file);

      expect(result).toEqual(mockAttachment);
    });

    it("propagates the error instead of fabricating an attachment on 404", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "No encontrada" }), { status: 404 }));
      const { uploadEnrollmentAttachment } = await importService();

      await expect(uploadEnrollmentAttachment("app-456", "DNI_FRONT", file)).rejects.toThrow("No encontrada");
    });

    it("propagates the error instead of fabricating an attachment on 405", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "Método no permitido" }), { status: 405 }));
      const { uploadEnrollmentAttachment } = await importService();

      await expect(uploadEnrollmentAttachment("app-456", "DNI_FRONT", file)).rejects.toThrow("Método no permitido");
    });

    it("propagates a network failure instead of fabricating an attachment", async () => {
      institutionalApiFetchMock.mockRejectedValue(new Error("Network error"));
      const { uploadEnrollmentAttachment } = await importService();

      await expect(uploadEnrollmentAttachment("app-456", "DNI_FRONT", file)).rejects.toThrow("Network error");
    });
  });

  describe("deleteEnrollmentAttachment", () => {
    it("resolves without error when the backend confirms deletion", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));
      const { deleteEnrollmentAttachment } = await importService();

      await expect(deleteEnrollmentAttachment("app-456", "att-1")).resolves.toBeUndefined();
    });

    it("propagates the error instead of silently succeeding on 404", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "No encontrado" }), { status: 404 }));
      const { deleteEnrollmentAttachment } = await importService();

      await expect(deleteEnrollmentAttachment("app-456", "att-1")).rejects.toThrow("No encontrado");
    });

    it("propagates the error instead of silently succeeding on 405", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "Método no permitido" }), { status: 405 }));
      const { deleteEnrollmentAttachment } = await importService();

      await expect(deleteEnrollmentAttachment("app-456", "att-1")).rejects.toThrow("Método no permitido");
    });
  });
});
