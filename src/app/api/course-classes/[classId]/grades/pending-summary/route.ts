import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function GET(_request: Request, { params }: { params: Promise<{ classId: string }> }): Promise<Response> {
  const user = await requireInstitutionalUser();
  const { classId } = await params;

  return createPassthroughResponse(
    await institutionalApiFetch(`/api/v1/institutions/${user.institutionId}/course-classes/${classId}/grades/pending-summary`),
  );
}
