import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";

import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string; enrollmentId: string; gradeId: string }> },
): Promise<Response> {
  const user = await requireInstitutionalUser();

  const { classId, enrollmentId, gradeId } = await params;

  const query = new URL(request.url).search;

  return createPassthroughResponse(
    await institutionalApiFetch(
      `/api/v1/institutions/${user.institutionId}/teacher/classes/${classId}/enrollments/${enrollmentId}/grades/${gradeId}/history${query}`,
    ),
  );
}
