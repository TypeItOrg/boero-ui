import type { EnrollmentApplication, EnrollmentApplicationResponse } from "../types/enrollment-application.types";
import type * as ServiceModule from "./enrollment-application.service";

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

  describe("fetchEnrollmentApplicationTrainingPaths", () => {
    it("fetches the eligible training paths for the application", async () => {
      const mockTrainingPaths = [{ id: "tp-1", name: "Guitarra", description: "", active: true, institutionId: "inst-1" }];
      institutionalApiFetchMock.mockResolvedValue(Response.json(mockTrainingPaths));
      const { fetchEnrollmentApplicationTrainingPaths } = await importService();

      const result = await fetchEnrollmentApplicationTrainingPaths("app-456");

      expect(institutionalApiFetchMock).toHaveBeenCalledWith("/api/v1/enrollment-applications/app-456/training-paths", { method: "GET" });
      expect(result).toEqual(mockTrainingPaths);
    });

    it("propagates the error instead of fabricating an empty list on failure", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "No encontrada" }), { status: 404 }));
      const { fetchEnrollmentApplicationTrainingPaths } = await importService();

      await expect(fetchEnrollmentApplicationTrainingPaths("app-456")).rejects.toThrow("No encontrada");
    });
  });

  describe("fetchEnrollmentApplicationStudyPlanSpaces", () => {
    it("fetches the eligible study plan spaces for the application", async () => {
      const mockSpaces = [
        {
          id: "s-1",
          studyPlanId: "plan-1",
          academicSpaceId: "as-1",
          academicSpaceName: "Práctica de Conjunto",
          academicLevelId: null,
          academicLevelName: null,
          requirementType: "REQUIRED",
          displayOrder: 1,
          approvalMode: "PROMOTION",
          requiresInstrument: false,
          allowedInstruments: [],
        },
      ];
      institutionalApiFetchMock.mockResolvedValue(Response.json(mockSpaces));
      const { fetchEnrollmentApplicationStudyPlanSpaces } = await importService();

      const result = await fetchEnrollmentApplicationStudyPlanSpaces("app-456");

      expect(institutionalApiFetchMock).toHaveBeenCalledWith("/api/v1/enrollment-applications/app-456/study-plan-spaces", { method: "GET" });
      expect(result).toEqual(mockSpaces);
    });

    it("propagates the error instead of fabricating an empty list on failure", async () => {
      institutionalApiFetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "Error del servidor" }), { status: 500 }));
      const { fetchEnrollmentApplicationStudyPlanSpaces } = await importService();

      await expect(fetchEnrollmentApplicationStudyPlanSpaces("app-456")).rejects.toThrow("Error del servidor");
    });
  });
});

describe("enrollment-application.service institutional queries", () => {
  const enrollmentApplicationApiFetchMock = jest.fn<Promise<Response>, [string, RequestInit?]>();

  async function importInstitutionalService(): Promise<typeof ServiceModule> {
    jest.doMock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
      institutionalApiFetch: enrollmentApplicationApiFetchMock,
    }));
    return import("./enrollment-application.service");
  }

  const INSTITUTION_ID = "00000000-0000-4000-8000-000000000001";
  const APPLICATION_ID = "00000000-0000-4000-8000-000000000002";

  const APPLICATION: EnrollmentApplication = {
    applicationId: APPLICATION_ID,
    institutionId: INSTITUTION_ID,
    personId: "00000000-0000-4000-8000-000000000003",
    applicantFirstName: "Ana",
    applicantLastName: "Garcia",
    applicantDocumentNumber: "12345678",
    studyPlanId: "00000000-0000-4000-8000-000000000004",
    studyPlanName: "Plan Básico",
    academicYearId: "00000000-0000-4000-8000-000000000005",
    academicYear: 2027,
    enrollmentPeriodId: "00000000-0000-4000-8000-000000000006",
    status: "SUBMITTED",
    isEditable: false,
    createdAt: "2026-09-05T09:00:00",
    updatedAt: "2026-09-05T09:00:00",
  };

  beforeEach(() => {
    jest.resetModules();
    enrollmentApplicationApiFetchMock.mockReset();
  });

  it("fetches the staff enrollment applications with pagination and default sort", async () => {
    enrollmentApplicationApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify({ items: [APPLICATION], page: 0, size: 10, totalItems: 1, totalPages: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const service = await importInstitutionalService();
    const result = await service.fetchEnrollmentApplications(INSTITUTION_ID, { page: 0, size: 10 });

    expect(result.items).toEqual([APPLICATION]);
    const [path] = enrollmentApplicationApiFetchMock.mock.calls[0];
    expect(path).toBe(`/api/v1/institutions/${INSTITUTION_ID}/enrollment-applications?page=0&size=10&sort=createdAt%2Cdesc`);
  });

  it("appends the status filter when provided", async () => {
    enrollmentApplicationApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify({ items: [], page: 0, size: 10, totalItems: 0, totalPages: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const service = await importInstitutionalService();
    await service.fetchEnrollmentApplications(INSTITUTION_ID, { page: 2, size: 20, status: "SUBMITTED" });

    const [path] = enrollmentApplicationApiFetchMock.mock.calls[0];
    expect(path).toBe(`/api/v1/institutions/${INSTITUTION_ID}/enrollment-applications?page=2&size=20&sort=createdAt%2Cdesc&status=SUBMITTED`);
  });

  it("fetches the applicant own applications from the my-enrollment-applications endpoint", async () => {
    enrollmentApplicationApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify({ items: [APPLICATION], page: 0, size: 10, totalItems: 1, totalPages: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const service = await importInstitutionalService();
    await service.fetchMyEnrollmentApplications(INSTITUTION_ID, { page: 0, size: 10 });

    const [path] = enrollmentApplicationApiFetchMock.mock.calls[0];
    expect(path).toBe(`/api/v1/institutions/${INSTITUTION_ID}/my-enrollment-applications?page=0&size=10&sort=createdAt%2Cdesc`);
  });

  it("throws an HttpResponseError when the list endpoint fails", async () => {
    enrollmentApplicationApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    const service = await importInstitutionalService();
    await expect(service.fetchEnrollmentApplications(INSTITUTION_ID, { page: 0, size: 10 })).rejects.toMatchObject({
      status: 500,
    });
  });
});
