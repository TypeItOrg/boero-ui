import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function GET(request: Request, { params }: { params: Promise<{ applicationId: string; attachmentId: string }> }): Promise<Response> {
  const { applicationId, attachmentId } = await params;

  try {
    const response = await institutionalApiFetch(`/api/v1/enrollment-applications/${applicationId}/attachments/${attachmentId}/content`, {
      signal: request.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      return new Response(body, {
        status: response.status,
        headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
      });
    }

    const body = await response.arrayBuffer();
    const headers = new Headers({ "cache-control": "private, no-store" });
    const contentType = response.headers.get("content-type");
    const contentDisposition = response.headers.get("content-disposition");
    const contentLength = response.headers.get("content-length");
    if (contentType) headers.set("content-type", contentType);
    if (contentDisposition) headers.set("content-disposition", contentDisposition);
    if (contentLength) headers.set("content-length", contentLength);

    return new Response(body, { status: response.status, headers });
  } catch {
    return Response.json({ message: "No se pudo obtener el archivo adjunto." }, { status: 503 });
  }
}
