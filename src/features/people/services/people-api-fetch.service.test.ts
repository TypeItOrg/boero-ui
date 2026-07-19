describe("peopleApiFetch", () => {
  const institutionalApiFetchMock = jest.fn();
  const platformApiFetchMock = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    institutionalApiFetchMock.mockReset();
    platformApiFetchMock.mockReset();

    jest.doMock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
      institutionalApiFetch: institutionalApiFetchMock,
    }));
    jest.doMock("@features/platform-auth/services/platform-api-fetch.service", () => ({
      platformApiFetch: platformApiFetchMock,
    }));
  });

  it("uses the institutional session for institutional people requests", async () => {
    const response = new Response(null, { status: 204 });
    institutionalApiFetchMock.mockResolvedValue(response);
    const { peopleApiFetch } = await import("./people-api-fetch.service");
    const init = { method: "PUT" };

    await expect(peopleApiFetch("institutional", "/api/v1/people/1", init)).resolves.toBe(response);

    expect(institutionalApiFetchMock).toHaveBeenCalledWith("/api/v1/people/1", init);
    expect(platformApiFetchMock).not.toHaveBeenCalled();
  });

  it("uses the platform session for admin people requests", async () => {
    const response = new Response(null, { status: 204 });
    platformApiFetchMock.mockResolvedValue(response);
    const { peopleApiFetch } = await import("./people-api-fetch.service");

    await expect(peopleApiFetch("admin", "/api/v1/admin/people")).resolves.toBe(response);

    expect(platformApiFetchMock).toHaveBeenCalledWith("/api/v1/admin/people", {});
    expect(institutionalApiFetchMock).not.toHaveBeenCalled();
  });
});
