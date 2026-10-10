import { HttpResponseError } from "@common/utils/http-response-error.util";

import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

jest.mock("@features/platform-auth/services/platform-api-fetch.service");

describe("fetchInstitution", () => {
  const fetchMock = jest.mocked(platformApiFetch);

  it("returns the institution fetched from the platform namespace", async () => {
    const institution = { id: "institution-id", name: "UTN FRVM", active: true };
    fetchMock.mockResolvedValue(Response.json(institution));

    await expect(fetchInstitution("institution-id")).resolves.toEqual(institution);
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/admin/institutions/institution-id");
  });

  it("returns null for a missing institution", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(fetchInstitution("institution-id")).resolves.toBeNull();
  });

  it.each([401, 403, 503])("preserves HTTP %s instead of treating it as a missing institution", async (status) => {
    fetchMock.mockResolvedValue(new Response(null, { status }));

    await expect(fetchInstitution("institution-id")).rejects.toEqual(new HttpResponseError(INSTITUTION_ERROR_MESSAGES.FETCH_INSTITUTION, status));
  });
});
