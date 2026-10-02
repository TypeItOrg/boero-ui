jest.mock("@common/services/public-api-fetch.service", () => ({ publicApiFetch: jest.fn() }));
import { GET } from "@app/api/public/institutions/[institutionId]/logo/route";
import { publicApiFetch } from "@common/services/public-api-fetch.service";
const id = "22222222-2222-4222-8222-222222222222";
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP1sAAAAASUVORK5CYII=", "base64");
function get(institutionId = id): Promise<Response> {
  return GET(new Request("https://testing.typeit.com.ar/api/public/logo?v=opaque%2Bversion"), { params: Promise.resolve({ institutionId }) });
}
it("[L03.logo-cache-fallback] streams real PNG bytes no-store without exposing provider paths", async () => {
  jest.mocked(publicApiFetch).mockResolvedValue(new Response(png, { headers: { "Content-Type": "image/png", "X-Storage-Key": "private/secret" } }));
  const response = await get();
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  expect(response.headers.get("X-Storage-Key")).toBeNull();
  expect(Buffer.from(await response.arrayBuffer())).toEqual(png);
  expect(publicApiFetch).toHaveBeenCalledWith(`/api/v1/institutions/${id}/logo?v=opaque%2Bversion`);
});
it.each(["image/svg+xml", "text/html", "application/octet-stream"])("[L03.real-image-validation] does not serve unsupported %s", async (type) => {
  jest.mocked(publicApiFetch).mockResolvedValue(new Response(png, { headers: { "Content-Type": type } }));
  expect((await get()).status).toBe(503);
});
it("[L03.real-image-validation] rejects MIME-spoofed non-image bytes", async () => {
  jest.mocked(publicApiFetch).mockResolvedValue(new Response("<svg onload='alert(1)'/>", { headers: { "Content-Type": "image/png" } }));
  expect((await get()).status).toBe(503);
});
it("[L03.logo-cache-fallback] invalid IDs/missing logo/outage never expose backend response", async () => {
  expect((await get("../private")).status).toBe(404);
  expect(publicApiFetch).not.toHaveBeenCalled();
  jest.mocked(publicApiFetch).mockResolvedValueOnce(new Response("private/path", { status: 404 }));
  expect((await get()).status).toBe(404);
  jest.mocked(publicApiFetch).mockRejectedValueOnce(new Error("private/provider"));
  const response = await get();
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private");
});
