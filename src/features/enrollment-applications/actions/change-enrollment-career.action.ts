"use server";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { mutateEnrollmentApplication } from "@features/enrollment-applications/services/mutate-enrollment-application.service";
import type { ChangeEnrollmentCareerResult } from "@features/enrollment-applications/types/change-enrollment-career-result.types";
import { ENROLLMENT_APPLICATIONS_API_PATH } from "@features/enrollment-applications/constants/enrollment-application.constants";

export async function changeEnrollmentCareerAction(applicationId: string, trainingPathId: string): Promise<ChangeEnrollmentCareerResult> {
  if (!isValidUuid(applicationId) || !isValidUuid(trainingPathId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return mutateEnrollmentApplication(
    `${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/draft`,
    "PATCH",
    ENROLLMENT_MESSAGES.CAREER_CHANGE_FAILED,
    { data: { careerSelection: { trainingPathId } } },
  );
}
