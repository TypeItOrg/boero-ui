jest.mock("@features/institutional-auth/services/institutional-api-fetch.service", () => ({
  institutionalApiFetch: jest.fn(),
}));

import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { GET } from "./route";

describe("GET /api/enrollment-applications/[applicationId]/attachments/[attachmentId]/content", () => {
  const institutionalApiFetchMock = jest.mocked(institutionalApiFetch);
  const applicationId = "11111111-1111-1111-1111-111111111111";
  const attachmentId = "22222222-2222-2222-2222-222222222222";

  beforeEach(() => institutionalApiFetchMock.mockReset());

  function makeRequest(): Request {
    return new Request(`http://localhost/api/enrollment-applications/${applicationId}/attachments/${attachmentId}/content`);
  }

  function makeParams(): { params: Promise<{ applicationId: string; attachmentId: string }> } {
    return { params: Promise.resolve({ applicationId, attachmentId }) };
  }

  it("streams the attachment content with the backend's content type and disposition headers", async () => {
    const fileBytes = new TextEncoder().encode("%PDF-1.4 fake content");
    institutionalApiFetchMock.mockResolvedValue(
      new Response(fileBytes, {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": 'inline; filename="dni.pdf"',
          "content-length": String(fileBytes.length),
        },
      }),
    );

    const response = await GET(makeRequest(), makeParams());

    expect(institutionalApiFetchMock).toHaveBeenCalledWith(`/api/v1/enrollment-applications/${applicationId}/attachments/${attachmentId}/content`, {
      signal: expect.anything(),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toBe('inline; filename="dni.pdf"');
    const body = await response.arrayBuffer();
    expect(new Uint8Array(body)).toEqual(fileBytes);
  });

  it("preserves backend errors instead of masking them as a generic failure", async () => {
    institutionalApiFetchMock.mockResolvedValue(Response.json({ message: "No encontrado" }, { status: 404 }));

    const response = await GET(makeRequest(), makeParams());

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ message: "No encontrado" });
  });

  it("maps transport failures to service unavailable", async () => {
    institutionalApiFetchMock.mockRejectedValue(new Error("network error"));

    const response = await GET(makeRequest(), makeParams());

    expect(response.status).toBe(503);
  });
});
