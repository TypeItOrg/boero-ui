import { z } from "zod";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { AcademicScope, getAcademicApiBase } from "@features/academic/utils/academic-scope.util";
import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";

export async function GET(request: Request): Promise<Response> {
  const parsed = z
    .object({
      operation: z.enum(["ENROLLMENT_PERIOD_CREATE", "ENROLLMENT_PERIOD_UPDATE"]),
      institutionId: z.uuid(),
      studyPlanId: z.uuid(),
      scope: z.enum([AcademicScope.ADMIN, AcademicScope.INSTITUTIONAL]),
    })
    .safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) {
    return Response.json({ message: ENROLLMENT_MESSAGES.PERIOD_SCOPE_REQUIRED }, { status: 400 });
  }
  const { institutionId, studyPlanId, scope, operation } = parsed.data;
  try {
    return createPassthroughResponse(
      await academicApiFetch(
        scope,
        `${getAcademicApiBase(scope, institutionId)}/enrollment-period-options/${studyPlanId}/levels?operation=${operation}`,
        { signal: request.signal },
      ),
    );
  } catch {
    return Response.json({ message: ENROLLMENT_MESSAGES.PERIOD_SCOPE_LOAD_FAILED }, { status: 503 });
  }
}
