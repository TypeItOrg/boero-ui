import "server-only";
import { z } from "zod";
import type { NextRequest } from "next/server";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { getAcademicApiBase } from "@features/academic/utils/academic-scope.util";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";
export async function readDocumentCatalog(
  request: NextRequest,
  context: { params: Promise<{ institutionId: string; segments?: string[] }> },
  scope: AcademicScope,
): Promise<Response> {
  const { institutionId, segments = [] } = await context.params;
  if (
    !z.uuid().safeParse(institutionId).success ||
    segments.length > 2 ||
    (segments.length > 0 && !z.uuid().safeParse(segments[0]).success) ||
    (segments.length === 2 && segments[1] !== "training-paths")
  ) {
    return Response.json({ message: "Consulta documental inválida." }, { status: 400 });
  }
  const input = z
    .object({
      page: z.coerce.number().int().min(0).default(0),
      size: z.coerce
        .number()
        .refine((v) => PAGE_SIZE_OPTIONS.includes(v as (typeof PAGE_SIZE_OPTIONS)[number]))
        .default(20),
      search: z.string().max(150).default(""),
      active: z.enum(["true", "false"]).optional(),
      trainingPathId: z.uuid().optional(),
      applicationId: z.uuid().optional(),
      forTrainingPathCreation: z.enum(["true", "false"]).optional(),
    })
    .safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!input.success) {
    return Response.json({ message: "Revisá los filtros." }, { status: 400 });
  }
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(input.data)) {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  }
  try {
    const response = await academicApiFetch(
      scope,
      `${getAcademicApiBase(scope, institutionId)}/document-definitions${segments.length ? "/" + segments.join("/") : ""}?${query}`,
      { signal: request.signal },
    );
    return new Response(await response.text(), {
      status: response.status,
      headers: { "content-type": "application/json", "cache-control": "private, no-store" },
    });
  } catch {
    return Response.json({ message: "No se pudo consultar la documentación. Intentá nuevamente." }, { status: 503 });
  }
}
