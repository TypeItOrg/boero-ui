import "server-only";

import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { getAcademicApiBase, type AcademicScope } from "@features/academic/utils/academic-scope.util";
import { z } from "zod";

const courseOptionsRequestSchema = z.object({
  resource: z.enum(["teachers", "spaces"]),
  institutionId: z.uuid(),
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(50).default(50),
  search: z.string().trim().max(100).default(""),
  studyPlanId: z.uuid().optional(),
});

export async function proxyCourseOptionsGet(request: Request, resourceSegment: string, scope: AcademicScope): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const parsed = courseOptionsRequestSchema.safeParse({
    resource: resourceSegment,
    ...Object.fromEntries(searchParams),
  });
  if (!parsed.success) {
    return Response.json({ message: "Los parámetros de opciones de cursos no son válidos." }, { status: 400 });
  }
  if (parsed.data.resource === "spaces" && !parsed.data.studyPlanId) {
    return Response.json({ message: "Seleccioná un plan de estudio." }, { status: 400 });
  }

  const backendParams = new URLSearchParams({
    page: String(parsed.data.page),
    size: String(parsed.data.size),
  });
  if (parsed.data.search) backendParams.set("search", parsed.data.search);
  if (parsed.data.studyPlanId) backendParams.set("studyPlanId", parsed.data.studyPlanId);

  const backendPath = `${getAcademicApiBase(scope, parsed.data.institutionId)}/courses/${parsed.data.resource}?${backendParams}`;
  try {
    const response = await academicApiFetch(scope, backendPath, { signal: request.signal });
    return createPassthroughResponse(response);
  } catch {
    return Response.json({ message: "El servicio de opciones de cursos no está disponible." }, { status: 503 });
  }
}
