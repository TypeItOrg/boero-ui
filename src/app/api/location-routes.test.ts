jest.mock("@features/locations/services/proxy-location-get.service", () => ({
  proxyLocationGet: jest.fn(),
}));

import { GET as getCities } from "@app/api/cities/route";
import { GET as getCountries } from "@app/api/countries/route";
import { GET as getCountryProvinces } from "@app/api/countries/[countryId]/provinces/route";
import { GET as getProvinceCities } from "@app/api/provinces/[provinceId]/cities/route";
import { LOCATION_ERROR_MESSAGES } from "@features/locations/constants/error-messages.constants";
import { proxyLocationGet } from "@features/locations/services/proxy-location-get.service";

const LOCATION_ID = "019e18e4-c93b-7583-90a6-0e9410ce3ad3";

describe("location API routes", () => {
  const proxyLocationGetMock = jest.mocked(proxyLocationGet);
  const request = new Request("https://app.example.test/api/locations?page=0&size=20");

  beforeEach(() => {
    proxyLocationGetMock.mockResolvedValue(new Response(null, { status: 204 }));
  });

  it("proxies the countries collection", async () => {
    await getCountries(request);

    expect(proxyLocationGetMock).toHaveBeenCalledWith(request, "/api/v1/countries");
  });

  it("proxies the cities collection", async () => {
    await getCities(request);

    expect(proxyLocationGetMock).toHaveBeenCalledWith(request, "/api/v1/cities");
  });

  it("proxies provinces for a valid country", async () => {
    await getCountryProvinces(request, { params: Promise.resolve({ countryId: LOCATION_ID }) });

    expect(proxyLocationGetMock).toHaveBeenCalledWith(request, `/api/v1/countries/${LOCATION_ID}/provinces`);
  });

  it("proxies cities for a valid province", async () => {
    await getProvinceCities(request, { params: Promise.resolve({ provinceId: LOCATION_ID }) });

    expect(proxyLocationGetMock).toHaveBeenCalledWith(request, `/api/v1/provinces/${LOCATION_ID}/cities`);
  });

  it.each([
    ["country", () => getCountryProvinces(request, { params: Promise.resolve({ countryId: "invalid" }) })],
    ["province", () => getProvinceCities(request, { params: Promise.resolve({ provinceId: "invalid" }) })],
  ])("rejects an invalid %s identifier", async (_locationType, callRoute) => {
    const response = await callRoute();

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: LOCATION_ERROR_MESSAGES.INVALID_LOCATION_ID });
    expect(proxyLocationGetMock).not.toHaveBeenCalled();
  });
});
