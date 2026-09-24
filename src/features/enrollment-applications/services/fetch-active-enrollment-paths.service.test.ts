jest.mock("@features/enrollment-applications/services/enrollment-application.service", () => ({ fetchMyEnrollmentApplications: jest.fn() }));
jest.mock("@features/academic-offers/services/academic-offer.service", () => ({ fetchAcademicOffer: jest.fn() }));

import { fetchAcademicOffer } from "@features/academic-offers/services/academic-offer.service";
import { fetchMyEnrollmentApplications } from "@features/enrollment-applications/services/enrollment-application.service";
import { fetchActiveEnrollmentPaths } from "@features/enrollment-applications/services/fetch-active-enrollment-paths.service";

const INSTITUTION_ID = "institution-1";

describe("fetchActiveEnrollmentPaths", () => {
  const fetchMyMock = jest.mocked(fetchMyEnrollmentApplications);

  beforeEach(() => {
    fetchMyMock.mockReset();
    jest.mocked(fetchAcademicOffer).mockReset();
  });

  it("scopes the active applications to the given applicant so a guardian only sees exclusions for that person", async () => {
    fetchMyMock.mockResolvedValue({
      items: [{ studyPlanId: "plan-1", data: { careerSelection: { trainingPathId: "path-1" } } }],
      page: 0,
      size: 50,
      totalItems: 1,
      totalPages: 1,
    } as never);

    const result = await fetchActiveEnrollmentPaths(INSTITUTION_ID, "dependent-1");

    expect(fetchMyMock).toHaveBeenCalled();
    for (const [, params] of fetchMyMock.mock.calls) {
      expect(params).toMatchObject({ dependentPersonId: "dependent-1" });
    }
    expect(result.trainingPathIds.has("path-1")).toBe(true);
  });

  it("does not scope the request when no applicant is given", async () => {
    fetchMyMock.mockResolvedValue({ items: [], page: 0, size: 50, totalItems: 0, totalPages: 0 } as never);

    await fetchActiveEnrollmentPaths(INSTITUTION_ID);

    for (const [, params] of fetchMyMock.mock.calls) {
      expect(params).not.toHaveProperty("dependentPersonId");
    }
  });
});
