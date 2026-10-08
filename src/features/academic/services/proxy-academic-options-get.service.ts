import { z } from "zod";

import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { getAcademicApiBase, type AcademicScope } from "@features/academic/utils/academic-scope.util";

const academicOptionsRequestSchema = z.object({
  operation: z
    .enum([
      "COURSE_CREATE",
      "COURSE_UPDATE",
      "STUDY_PLAN_CREATE",
      "STUDY_PLAN_CURRICULUM_UPDATE",
      "ENROLLMENT_PERIOD_CREATE",
      "ENROLLMENT_PERIOD_UPDATE",
    ])
    .optional(),
  resource: z.enum(["training-paths", "academic-spaces", "study-plans", "academic-years", "instruments"]),
  institutionId: z.uuid(),
  active: z.enum(["true", "false", "all"]).default("true"),
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(50).default(50),
  search: z.string().trim().max(100).default(""),
  published: z.enum(["true", "false"]).optional(),
  trainingPathId: z.uuid().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).optional(),
});

const DEFAULT_SORT_BY_RESOURCE: Record<"training-paths" | "academic-spaces" | "study-plans" | "academic-years" | "instruments", string> = {
  instruments: "name,asc",
  "academic-spaces": "name,asc",
  "academic-years": "year,desc",
  "study-plans": "name,asc",
  "training-paths": "name,asc",
};

export async function proxyAcademicOptionsGet(request: Request, resourceSegment: string, scope: AcademicScope): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const parsed = academicOptionsRequestSchema.safeParse({
    resource: resourceSegment,
    ...Object.fromEntries(searchParams),
  });

  if (!parsed.success) {
    return Response.json({ message: "Los parámetros de opciones académicas no son válidos." }, { status: 400 });
  }

  const backendParams = new URLSearchParams({
    deleted: "false",
    page: String(parsed.data.page),
    size: String(parsed.data.size),
    sort: DEFAULT_SORT_BY_RESOURCE[parsed.data.resource],
  });

  if (parsed.data.operation) {
    backendParams.set("operation", parsed.data.operation);
  }

  if (parsed.data.active !== "all") {
    backendParams.set("active", parsed.data.active);
  }

  if (parsed.data.search) {
    backendParams.set("search", parsed.data.search);
  }

  if (parsed.data.published) {
    backendParams.set("published", parsed.data.published);
  }
  if (parsed.data.trainingPathId) {
    backendParams.set("trainingPathId", parsed.data.trainingPathId);
  }

  if (parsed.data.status) {
    backendParams.set("status", parsed.data.status);
  }

  const backendPath = `${getAcademicApiBase(scope, parsed.data.institutionId)}/academic-options/${parsed.data.resource}?${backendParams}`;

  try {
    const response = await academicApiFetch(scope, backendPath, { signal: request.signal });

    return createPassthroughResponse(response);
  } catch {
    return Response.json({ message: "El servicio de opciones académicas no está disponible." }, { status: 503 });
  }
}
