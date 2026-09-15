import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { isValidUuid } from "@common/utils/action-argument.util";
import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function GET(request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;

  if (!isValidUuid(applicationId)) {
    return Response.json({ message: ENROLLMENT_MESSAGES.APPLICATION_ID_INVALID }, { status: 400 });
  }

  try {
    return createPassthroughResponse(await institutionalApiFetch(`/api/v1/enrollment-applications/${applicationId}`, { signal: request.signal }));
  } catch {
    return Response.json({ message: ENROLLMENT_MESSAGES.APPLICATION_UNAVAILABLE }, { status: 503 });
  }
}
