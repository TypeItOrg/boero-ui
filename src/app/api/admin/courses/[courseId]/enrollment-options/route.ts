import { COMMON_ERROR_MESSAGES } from "@common/constants/error-messages.constants";
import { NextRequest } from "next/server";

import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { getPlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

export async function GET(request: NextRequest, context: { params: Promise<{ courseId: string }> }): Promise<Response> {
  const account = await getPlatformAccount();

  if (!account) {
    return Response.json({ message: COMMON_ERROR_MESSAGES.SESSION_REQUIRED }, { status: 401, headers: { "cache-control": "private, no-store" } });
  }

  const { courseId } = await context.params;
  const institutionId = request.nextUrl.searchParams.get("institutionId");
  const response = await platformApiFetch(`/api/v1/institutions/${institutionId}/courses/${courseId}/enrollment-options`);
  return createPassthroughResponse(response);
}
