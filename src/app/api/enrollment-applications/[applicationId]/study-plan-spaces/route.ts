import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { isValidUuid } from "@common/utils/action-argument.util";
import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function GET(request: Request, { params }: { params: Promise<{ applicationId: string }> }): Promise<Response> {
  const { applicationId } = await params;

  if (!isValidUuid(applicationId)) {
    return Response.json({ message: ENROLLMENT_MESSAGES.APPLICATION_INVALID }, { status: 400 });
  }

  try {
    const response = await institutionalApiFetch(`/api/v1/enrollment-applications/${applicationId}/study-plan-spaces`, { signal: request.signal });

    return createPassthroughResponse(response);
  } catch {
    return Response.json({ message: ENROLLMENT_MESSAGES.SPACES_UNAVAILABLE }, { status: 503 });
  }
}
