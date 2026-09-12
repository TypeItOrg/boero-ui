"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { ENROLLMENT_APPLICATION_ERROR_MESSAGES } from "../constants/enrollment-application-error-messages.constants";
import type { EnrollmentApplicationRejectActionState } from "../types/enrollment-application-reject-action-state.types";
import type { EnrollmentApplicationRejectField } from "../types/enrollment-application-reject-field.types";

const REJECT_FIELDS: readonly EnrollmentApplicationRejectField[] = ["rejectionReason"];
const UPDATE_PATH = "/admin/enrollment-applications";

const rejectionReasonSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(1, ENROLLMENT_APPLICATION_ERROR_MESSAGES.INVALID_REJECTION_REASON)
    .max(1000, "El motivo no puede superar los 1000 caracteres."),
});

export async function rejectPlatformEnrollmentApplicationAction(
  institutionId: string,
  applicationId: string,
  _state: EnrollmentApplicationRejectActionState,
  formData: FormData,
): Promise<EnrollmentApplicationRejectActionState> {
  if (!isValidUuid(institutionId) || !isValidUuid(applicationId)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const parsed = rejectionReasonSchema.safeParse({ rejectionReason: formData.get("rejectionReason") });
  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, REJECT_FIELDS);
  }

  const errorState = await getResponseErrorActionState(
    platformApiFetch(`/api/v1/admin/enrollment-applications/${institutionId}/${applicationId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectionReason: parsed.data.rejectionReason }),
    }),
    REJECT_FIELDS,
    ENROLLMENT_APPLICATION_ERROR_MESSAGES.REJECT,
  );
  if (errorState) return errorState;

  revalidatePath(UPDATE_PATH);
  revalidatePath(`${UPDATE_PATH}/${institutionId}/${applicationId}`);
  return { success: true };
}
