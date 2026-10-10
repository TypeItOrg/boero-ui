"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState } from "@common/utils/action-state.util";

import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { EnrollmentApplicationActionState } from "@features/enrollment-applications/types/enrollment-application-action-state.types";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

const UPDATE_PATH = "/admin/enrollment-applications";

export async function approvePlatformEnrollmentApplicationAction(
  institutionId: string,
  applicationId: string,
  provisional = false,
): Promise<EnrollmentApplicationActionState> {
  if (!isValidUuid(institutionId) || !isValidUuid(applicationId) || typeof provisional !== "boolean") {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const authError = await authorizeAcademicAction(AcademicScope.ADMIN, institutionId, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_APPROVE);

  if (authError) {
    return { error: authError.error };
  }

  const errorState = await getResponseErrorActionState(
    platformApiFetch(`/api/v1/admin/enrollment-applications/${institutionId}/${applicationId}/${provisional ? "approve-provisionally" : "approve"}`, {
      method: "POST",
    }),
    [],
    ENROLLMENT_MESSAGES.APPROVE,
  );

  if (errorState) {
    return errorState;
  }

  revalidatePath(UPDATE_PATH);
  revalidatePath(`${UPDATE_PATH}/${institutionId}/${applicationId}`);

  return { success: true };
}
