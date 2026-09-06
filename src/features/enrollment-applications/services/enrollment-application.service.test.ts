import type { EnrollmentApplication } from "../types/enrollment-application.types";
import type * as ServiceModule from "./enrollment-application.service";

const enrollmentApplicationApiFetchMock = jest.fn<Promise<Response>, [string, RequestInit?]>();

async function importService(): Promise<typeof ServiceModule> {
  jest.doMock("@features/enrollment-applications/services/enrollment-application-api-fetch.service", () => ({
    enrollmentApplicationApiFetch: enrollmentApplicationApiFetchMock,
  }));
  return import("@features/enrollment-applications/services/enrollment-application.service");
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

describe("enrollment-application.service", () => {
  beforeEach(() => {
    enrollmentApplicationApiFetchMock.mockReset();
  });

  it("fetches the staff enrollment applications with pagination and default sort", async () => {
    enrollmentApplicationApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify({ items: [APPLICATION], page: 0, size: 10, totalItems: 1, totalPages: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const service = await importService();
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

    const service = await importService();
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

    const service = await importService();
    await service.fetchMyEnrollmentApplications(INSTITUTION_ID, { page: 0, size: 10 });

    const [path] = enrollmentApplicationApiFetchMock.mock.calls[0];
    expect(path).toBe(`/api/v1/institutions/${INSTITUTION_ID}/my-enrollment-applications?page=0&size=10&sort=createdAt%2Cdesc`);
  });

  it("throws an HttpResponseError when the list endpoint fails", async () => {
    enrollmentApplicationApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    const service = await importService();
    await expect(service.fetchEnrollmentApplications(INSTITUTION_ID, { page: 0, size: 10 })).rejects.toMatchObject({
      status: 500,
    });
  });
});
