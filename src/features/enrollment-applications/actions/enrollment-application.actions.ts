"use server";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { isValidUuid, INVALID_ACTION_ARGUMENTS } from "@common/utils/action-argument.util";
import { mutateEnrollmentApplication } from "@features/enrollment-applications/services/mutate-enrollment-application.service";
import {
  startEnrollmentApplicationSchema,
  updateEnrollmentDraftSchema,
} from "@features/enrollment-applications/schemas/enrollment-application.schema";
import type { StartEnrollmentApplicationInput } from "@features/enrollment-applications/types/start-enrollment-application-input.types";
import type { UpdateEnrollmentDraftInput } from "@features/enrollment-applications/types/update-enrollment-draft-input.types";
import type { ChangeEnrollmentCareerResult } from "@features/enrollment-applications/types/change-enrollment-career-result.types";
import { ENROLLMENT_APPLICATIONS_API_PATH } from "@features/enrollment-applications/constants/enrollment-application.constants";

export async function startOrGetEnrollmentApplicationAction(input: StartEnrollmentApplicationInput): Promise<ChangeEnrollmentCareerResult> {
  const parsed = startEnrollmentApplicationSchema.safeParse(input);

  if (!parsed.success) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return mutateEnrollmentApplication(ENROLLMENT_APPLICATIONS_API_PATH, "POST", ENROLLMENT_MESSAGES.START_FAILED, parsed.data);
}

export async function updateEnrollmentDraftAction(applicationId: string, input: UpdateEnrollmentDraftInput): Promise<ChangeEnrollmentCareerResult> {
  const parsed = updateEnrollmentDraftSchema.safeParse(input);

  if (!isValidUuid(applicationId) || !parsed.success) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return mutateEnrollmentApplication(
    `${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/draft`,
    "PATCH",
    ENROLLMENT_MESSAGES.DRAFT_SAVE_FAILED,
    parsed.data,
  );
}

export async function submitEnrollmentApplicationAction(applicationId: string): Promise<ChangeEnrollmentCareerResult> {
  if (!isValidUuid(applicationId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return mutateEnrollmentApplication(`${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/submit`, "POST", ENROLLMENT_MESSAGES.SUBMISSION_FAILED);
}

export async function cancelEnrollmentApplicationAction(applicationId: string): Promise<ChangeEnrollmentCareerResult> {
  if (!isValidUuid(applicationId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  return mutateEnrollmentApplication(
    `${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/cancel`,
    "POST",
    ENROLLMENT_MESSAGES.CANCEL_APPLICATION_FAILED,
  );
}
