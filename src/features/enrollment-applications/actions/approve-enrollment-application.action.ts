"use server";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { revalidatePath } from "next/cache";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { EnrollmentApplicationActionState } from "@features/enrollment-applications/types/enrollment-application-action-state.types";

const UPDATE_PATH = "/enrollment-applications";

export async function approveEnrollmentApplicationAction(institutionId: string, applicationId: string): Promise<EnrollmentApplicationActionState> {
  if (!isValidUuid(institutionId) || !isValidUuid(applicationId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const authError = await authorizeAcademicAction(
    AcademicScope.INSTITUTIONAL,
    institutionId,
    INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_APPROVE,
  );

  if (authError) {
    return { error: authError.error };
  }

  const errorState = await getResponseErrorActionState(
    institutionalApiFetch(`/api/v1/institutions/${institutionId}/enrollment-applications/${applicationId}/approve`, { method: "POST" }),
    [],
    ENROLLMENT_MESSAGES.APPROVE,
  );

  if (errorState) {
    return errorState;
  }

  revalidatePath(UPDATE_PATH);

  return { success: true };
}
