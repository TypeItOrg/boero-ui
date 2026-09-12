"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { ENROLLMENT_APPLICATION_ERROR_MESSAGES } from "../constants/enrollment-application-error-messages.constants";
import type { EnrollmentApplicationActionState } from "../types/enrollment-application-action-state.types";

const UPDATE_PATH = "/admin/enrollment-applications";

export async function approvePlatformEnrollmentApplicationAction(
  institutionId: string,
  applicationId: string,
): Promise<EnrollmentApplicationActionState> {
  if (!isValidUuid(institutionId) || !isValidUuid(applicationId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const errorState = await getResponseErrorActionState(
    platformApiFetch(`/api/v1/admin/enrollment-applications/${institutionId}/${applicationId}/approve`, { method: "POST" }),
    [],
    ENROLLMENT_APPLICATION_ERROR_MESSAGES.APPROVE,
  );
  if (errorState) return errorState;

  revalidatePath(UPDATE_PATH);
  revalidatePath(`${UPDATE_PATH}/${institutionId}/${applicationId}`);
  return { success: true };
}
