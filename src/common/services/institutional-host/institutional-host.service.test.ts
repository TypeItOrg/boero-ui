jest.mock("next/headers", () => ({ headers: jest.fn() }));
import { headers } from "next/headers";
import {
  getRequestInstitution,
  rebuildInstitutionalHostHeader,
  resolveRequestInstitution,
  validateRequestInstitutionId,
} from "@common/services/institutional-host/institutional-host.service";

const institution = { id: "22222222-2222-4222-8222-222222222222", name: "Conservatorio Boero", publicSubdomain: "cboero", logoUrl: null };
const fetchMock = jest.fn();
const original = { api: process.env.BOERO_API_URL, public: process.env.FRONTEND_PUBLIC_URL, domain: process.env.INSTITUTIONAL_BASE_DOMAIN };
beforeEach(() => {
  process.env.BOERO_API_URL = "http://backend.test";
  process.env.FRONTEND_PUBLIC_URL = "https://testing.typeit.com.ar";
  process.env.INSTITUTIONAL_BASE_DOMAIN = "testing.typeit.com.ar";
  global.fetch = fetchMock;
  fetchMock.mockReset();
  jest.mocked(headers).mockResolvedValue(new Headers({ host: "cboero.testing.typeit.com.ar" }));
});
afterAll(() => {
  process.env.BOERO_API_URL = original.api;
  process.env.FRONTEND_PUBLIC_URL = original.public;
  process.env.INSTITUTIONAL_BASE_DOMAIN = original.domain;
});
it("ignores forged internal/forwarded headers and rebuilds from actual Host", () => {
  const incoming = new Headers({
    host: "cboero.testing.typeit.com.ar",
    "X-Institutional-Host": "otra.testing.typeit.com.ar",
    "X-Forwarded-Host": "evil.test",
  });
  const outgoing = new Headers(incoming);
  rebuildInstitutionalHostHeader(outgoing, incoming);
  expect(outgoing.get("X-Institutional-Host")).toBe("cboero.testing.typeit.com.ar");
  rebuildInstitutionalHostHeader(outgoing, new Headers({ host: "testing.typeit.com.ar", "X-Institutional-Host": "cboero.testing.typeit.com.ar" }));
  expect(outgoing.get("X-Institutional-Host")).toBe("testing.typeit.com.ar");
});
it("returns minimal no-store institution context without a tenant-global cache", async () => {
  fetchMock.mockImplementation(async () => new Response(JSON.stringify(institution)));
  expect(await resolveRequestInstitution(new Headers({ host: "cboero.testing.typeit.com.ar" }))).toEqual(institution);
  expect(await getRequestInstitution()).toEqual(institution);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }));
});
it("does not look up generic access", async () => {
  expect(await resolveRequestInstitution(new Headers({ host: "testing.typeit.com.ar" }))).toBeUndefined();
  expect(fetchMock).not.toHaveBeenCalled();
});
it.each([404, 503])("does not turn resolution status %s into a generic selector", async (status) => {
  fetchMock.mockResolvedValue(new Response(null, { status }));
  await expect(getRequestInstitution()).rejects.toMatchObject({ status });
});
it("reports transport outage and malformed responses as 503", async () => {
  fetchMock.mockRejectedValueOnce(new Error("offline"));
  await expect(getRequestInstitution()).rejects.toMatchObject({ status: 503 });
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ...institution, publicSubdomain: "otra" })));
  await expect(getRequestInstitution()).rejects.toMatchObject({ status: 503 });
});
it("rejects a tampered institution ID before a mutation", async () => {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(institution)));
  expect(await validateRequestInstitutionId("33333333-3333-4333-8333-333333333333")).toMatch(/no corresponde/);
});
