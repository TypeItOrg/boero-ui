"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { getResponseErrorActionState } from "@common/utils/action-state.util";

import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { DocumentRequestActionState } from "@features/enrollment-applications/types/document-request-action-state.types";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

export async function requestDocuments(
  scope: AcademicScope,
  institutionId: string,
  applicationId: string,
  previous: DocumentRequestActionState,
  form: FormData,
): Promise<DocumentRequestActionState> {
  const context = z
    .object({
      scope: z.enum(["institutional", "admin"]),
      institutionId: z.uuid(),
      applicationId: z.uuid(),
    })
    .safeParse({ scope, institutionId, applicationId });

  if (!context.success) {
    return { error: ENROLLMENT_MESSAGES.requestContext };
  }

  if (previous.uncertain) {
    return { error: ENROLLMENT_MESSAGES.requestUncertain, uncertain: true };
  }

  const auth = await authorizeAcademicAction(scope, institutionId, INSTITUTIONAL_PERMISSION.ENROLLMENT_DOCUMENT_REQUEST_CREATE);

  if (auth) {
    return { error: auth.error };
  }

  let documents: unknown;

  try {
    documents = JSON.parse(String(form.get("documents")));
  } catch {
    return { error: ENROLLMENT_MESSAGES.requestDocumentsInvalid };
  }

  const input = z
    .object({
      reason: z.string().trim().min(1).max(2000),
      documents: z
        .array(
          z.object({
            documentId: z.uuid(),
            level: z.enum(["AT_SUBMISSION", "BEFORE_CONFIRMATION", "OPTIONAL"]),
          }),
        )
        .min(1)
        .max(50),
    })
    .safeParse({ reason: form.get("reason"), documents });

  if (!input.success) {
    return { error: ENROLLMENT_MESSAGES.requestValidation };
  }

  let response: Response | undefined;

  const path =
    scope === "admin"
      ? `/api/v1/admin/enrollment-applications/${institutionId}/${applicationId}/document-requests`
      : `/api/v1/institutions/${institutionId}/enrollment-applications/${applicationId}/document-requests`;

  const pending = academicApiFetch(scope, path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input.data),
  }).then((result) => {
    response = result;

    return result;
  });

  const error = await getResponseErrorActionState(pending, [], ENROLLMENT_MESSAGES.requestReadFailed);

  if (error) {
    return { ...error, uncertain: !response || response.status >= 500 };
  }

  revalidatePath(scope === "admin" ? "/admin/enrollment-applications" : "/enrollment-applications");
  revalidatePath("/my-enrollment-applications");

  return { success: true };
}
