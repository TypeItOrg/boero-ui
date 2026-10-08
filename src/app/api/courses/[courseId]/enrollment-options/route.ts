import { COMMON_ERROR_MESSAGES } from "@common/constants/error-messages.constants";
import { NextRequest } from "next/server";

import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { getInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function GET(_request: NextRequest, context: { params: Promise<{ courseId: string }> }): Promise<Response> {
  const user = await getInstitutionalUser();

  if (!user) {
    return Response.json({ message: COMMON_ERROR_MESSAGES.SESSION_REQUIRED }, { status: 401, headers: { "cache-control": "private, no-store" } });
  }

  const { courseId } = await context.params;
  const response = await institutionalApiFetch(`/api/v1/institutions/${user.institutionId}/courses/${courseId}/enrollment-options`);
  return createPassthroughResponse(response);
}
