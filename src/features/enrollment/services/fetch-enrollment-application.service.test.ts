describe("fetchEnrollmentApplication", () => {
  type ServiceModule = typeof import("@features/enrollment/services/fetch-enrollment-application.service");

  const institutionalApiFetchMock = jest.fn<Promise<Response>, [string, RequestInit?]>();

  async function importService(): Promise<ServiceModule> {
    jest.doMock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
      institutionalApiFetch: institutionalApiFetchMock,
    }));

    return import("@features/enrollment/services/fetch-enrollment-application.service");
  }

  beforeEach(() => {
    jest.resetModules();
    institutionalApiFetchMock.mockReset();
  });

  it("returns the enrollment application detail", async () => {
    const payload = {
      applicationId: "application-1",
      personId: "person-1",
      institutionId: "institution-1",
      studyPlanId: "study-plan-1",
      academicYearId: "academic-year-1",
      enrollmentPeriodId: null,
      status: "DRAFT",
      isEditable: true,
      data: { careerSelection: { trainingPathId: "path-1" } },
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };
    institutionalApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } }),
    );

    const { fetchEnrollmentApplication } = await importService();
    await expect(fetchEnrollmentApplication("application-1")).resolves.toEqual(payload);
    expect(institutionalApiFetchMock).toHaveBeenCalledWith("/api/v1/enrollment-applications/application-1");
  });
});
