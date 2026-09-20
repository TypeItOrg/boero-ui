import { NextRequest } from "next/server";

import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

export async function GET(request: NextRequest, context: { params: Promise<{ courseId: string }> }): Promise<Response> {
  await requirePlatformAccount();
  const { courseId } = await context.params;
  const institutionId = request.nextUrl.searchParams.get("institutionId");
  const response = await platformApiFetch(`/api/v1/institutions/${institutionId}/courses/${courseId}/waitlist`);
  return createPassthroughResponse(response);
}
