import { z } from "zod";

import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { getAcademicApiBase, type AcademicScope } from "@features/academic/utils/academic-scope.util";

const academicOptionsRequestSchema = z.object({
  resource: z.enum(["training-paths", "academic-spaces"]),
  institutionId: z.uuid(),
  active: z.enum(["true", "false", "all"]).default("true"),
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(50).default(50),
  search: z.string().trim().max(100).default(""),
});

export async function proxyAcademicOptionsGet(
  request: Request,
  resourceSegment: string,
  scope: AcademicScope,
): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const parsed = academicOptionsRequestSchema.safeParse({
    resource: resourceSegment,
    ...Object.fromEntries(searchParams),
  });
  if (!parsed.success) {
    return Response.json({ message: "Los parámetros de opciones académicas no son válidos." }, { status: 400 });
  }

  const backendParams = new URLSearchParams({
    page: String(parsed.data.page),
    size: String(parsed.data.size),
    sort: "name,asc",
  });
  if (parsed.data.active !== "all") backendParams.set("active", parsed.data.active);
  if (parsed.data.search) backendParams.set("search", parsed.data.search);

  const backendPath = `${getAcademicApiBase(scope, parsed.data.institutionId)}/${parsed.data.resource}?${backendParams}`;
  try {
    const response = await academicApiFetch(scope, backendPath, { signal: request.signal });
    return createPassthroughResponse(response);
  } catch {
    return Response.json({ message: "El servicio de opciones académicas no está disponible." }, { status: 503 });
  }
}
