"use server";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { revalidatePath } from "next/cache";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { rejectionReasonSchema } from "@features/enrollment-applications/schemas/rejection-reason.schema";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { EnrollmentApplicationRejectActionState } from "@features/enrollment-applications/types/enrollment-application-reject-action-state.types";
import type { EnrollmentApplicationRejectField } from "@features/enrollment-applications/types/enrollment-application-reject-field.types";

const REJECT_FIELDS: readonly EnrollmentApplicationRejectField[] = ["rejectionReason"];

const UPDATE_PATH = "/enrollment-applications";

export async function rejectEnrollmentApplicationAction(
  institutionId: string,
  applicationId: string,
  _state: EnrollmentApplicationRejectActionState,
  formData: FormData,
): Promise<EnrollmentApplicationRejectActionState> {
  if (!isValidUuid(institutionId) || !isValidUuid(applicationId) || !(formData instanceof FormData)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const parsed = rejectionReasonSchema.safeParse({ rejectionReason: formData.get("rejectionReason") });

  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, REJECT_FIELDS);
  }

  const authError = await authorizeAcademicAction(AcademicScope.INSTITUTIONAL, institutionId, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_REJECT);

  if (authError) {
    return { error: authError.error };
  }

  const errorState = await getResponseErrorActionState(
    institutionalApiFetch(`/api/v1/institutions/${institutionId}/enrollment-applications/${applicationId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectionReason: parsed.data.rejectionReason }),
    }),
    REJECT_FIELDS,
    ENROLLMENT_MESSAGES.REJECT,
  );

  if (errorState) {
    return errorState;
  }

  revalidatePath(UPDATE_PATH);

  return { success: true };
}
