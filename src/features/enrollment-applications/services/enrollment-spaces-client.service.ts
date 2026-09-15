import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";

export async function fetchEnrollmentSpaces(applicationId: string): Promise<StudyPlanSpace[]> {
  const response = await fetch(`/api/enrollment-applications/${applicationId}/study-plan-spaces`, { cache: "no-store" });

  return parseHttpResponse(response, ENROLLMENT_MESSAGES.SPACES_UNAVAILABLE);
}
