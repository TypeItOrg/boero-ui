import { NextRequest } from "next/server";
import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function GET(request: NextRequest): Promise<Response> {
  const user = await requireInstitutionalUser();
  return createPassthroughResponse(
    await institutionalApiFetch(`/api/v1/institutions/${user.institutionId}/course-enrollment-options?${request.nextUrl.searchParams.toString()}`),
  );
}
