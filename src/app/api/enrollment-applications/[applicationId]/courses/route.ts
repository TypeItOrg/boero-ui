import { NextRequest } from "next/server";

import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";

export async function GET(request: NextRequest, context: { params: Promise<{ applicationId: string }> }): Promise<Response> {
  await requireInstitutionalUser();
  const { applicationId } = await context.params;
  const searchParams = new URLSearchParams(request.nextUrl.searchParams);
  const response = await institutionalApiFetch(`/api/v1/enrollment-applications/${applicationId}/courses?${searchParams.toString()}`);
  return createPassthroughResponse(response);
}
