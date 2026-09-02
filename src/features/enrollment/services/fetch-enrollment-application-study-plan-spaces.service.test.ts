describe("fetchEnrollmentApplicationStudyPlanSpaces", () => {
  type ServiceModule = typeof import("@features/enrollment/services/fetch-enrollment-application-study-plan-spaces.service");

  const institutionalApiFetchMock = jest.fn<Promise<Response>, [string, RequestInit?]>();

  async function importService(): Promise<ServiceModule> {
    jest.doMock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
      institutionalApiFetch: institutionalApiFetchMock,
    }));

    return import("@features/enrollment/services/fetch-enrollment-application-study-plan-spaces.service");
  }

  beforeEach(() => {
    jest.resetModules();
    institutionalApiFetchMock.mockReset();
  });

  it("returns the enrollment application study plan spaces", async () => {
    const payload = [
      {
        id: "study-plan-space-1",
        studyPlanId: "study-plan-1",
        academicSpaceId: "academic-space-1",
        academicSpaceName: "Matematica I",
        academicLevelId: "level-1",
        academicLevelName: "Primer ano",
        requirementType: "REQUIRED",
        displayOrder: 1,
        approvalMode: "PROMOTION",
        requiresInstrument: true,
        allowedInstruments: [{ instrumentId: "instrument-1", name: "Piano" }],
      },
    ];
    institutionalApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } }),
    );

    const { fetchEnrollmentApplicationStudyPlanSpaces } = await importService();
    await expect(fetchEnrollmentApplicationStudyPlanSpaces("application-1")).resolves.toEqual(payload);
    expect(institutionalApiFetchMock).toHaveBeenCalledWith("/api/v1/enrollment-applications/application-1/study-plan-spaces");
  });
});
