import { z } from "zod";

import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { DOCUMENT_MESSAGES } from "@features/enrollment-applications/constants/documentation.constants";

const headers = { "cache-control": "private, no-store", "x-content-type-options": "nosniff" };

export async function GET(request: Request, { params }: { params: Promise<{ applicationId: string }> }): Promise<Response> {
  const query = new URL(request.url).searchParams;
  const parsed = z
    .object({
      applicationId: z.string().uuid(),
      scope: z.enum(["admin", "institutional"]),
      requirementId: z.string().uuid().nullable(),
      page: z.string().regex(/^\d+$/),
      size: z.enum(["10", "20", "30", "40", "50"]),
    })
    .safeParse({
      ...(await params),
      scope: query.get("scope") ?? "institutional",
      requirementId: query.get("requirementId"),
      page: query.get("page") ?? "0",
      size: query.get("size") ?? "10",
    });

  if (!parsed.success) {
    return Response.json({ message: DOCUMENT_MESSAGES.invalid }, { status: 400, headers });
  }

  const value = parsed.data;
  const suffix = value.requirementId
    ? `history?requirementId=${value.requirementId}&page=${value.page}&size=${value.size}&sort=createdAt,desc&sort=id,desc`
    : "requirements";

  try {
    const response = await academicApiFetch(value.scope, `/api/v1/enrollment-applications/${value.applicationId}/attachments/${suffix}`, {
      signal: request.signal,
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: { ...headers, "content-type": "application/json" },
    });
  } catch {
    return Response.json({ message: DOCUMENT_MESSAGES.readFailed }, { status: 503, headers });
  }
}
