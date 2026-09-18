import { NextRequest } from "next/server";

import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function GET(_request: NextRequest, context: { params: Promise<{ courseId: string }> }): Promise<Response> {
  const user = await requireInstitutionalUser();
  const { courseId } = await context.params;
  const response = await institutionalApiFetch(`/api/v1/institutions/${user.institutionId}/courses/${courseId}/enrollment-options`);
  return createPassthroughResponse(response);
}
