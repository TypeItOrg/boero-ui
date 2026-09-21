import { z } from "zod";
import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { getAcademicApiBase } from "@features/academic/utils/academic-scope.util";
import { ROLE_SCOPE_MESSAGES as M } from "@features/people/constants/role-scope.constants";

const querySchema = z.object({
  institutionId: z.uuid(),
  scope: z.enum(["admin", "institutional"]),
  search: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: Request): Promise<Response> {
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) {
    return Response.json({ message: M.INVALID_OPTIONS }, { status: 400 });
  }
  const { institutionId, scope, page, size, search } = parsed.data;
  const params = new URLSearchParams({ page: String(page), size: String(size), search, sort: "name,asc" });
  try {
    return createPassthroughResponse(
      await academicApiFetch(scope, `${getAcademicApiBase(scope, institutionId)}/roles/training-path-options?${params}`, { signal: request.signal }),
    );
  } catch {
    return Response.json({ message: M.LOAD_ERROR }, { status: 503 });
  }
}
