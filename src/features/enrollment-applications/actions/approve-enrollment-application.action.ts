"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { ENROLLMENT_APPLICATION_ERROR_MESSAGES } from "../constants/enrollment-application-error-messages.constants";
import { enrollmentApplicationApiFetch } from "../services/enrollment-application-api-fetch.service";
import type { EnrollmentApplicationActionState } from "../types/enrollment-application-action-state.types";

const UPDATE_PATH = "/enrollment-applications";

export async function approveEnrollmentApplicationAction(institutionId: string, applicationId: string): Promise<EnrollmentApplicationActionState> {
  if (!isValidUuid(institutionId) || !isValidUuid(applicationId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const errorState = await getResponseErrorActionState(
    enrollmentApplicationApiFetch(`/api/v1/institutions/${institutionId}/enrollment-applications/${applicationId}/approve`, { method: "POST" }),
    [],
    ENROLLMENT_APPLICATION_ERROR_MESSAGES.APPROVE,
  );
  if (errorState) return errorState;

  revalidatePath(UPDATE_PATH);
  return { success: true };
}
