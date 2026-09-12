"use server";
import { redirect } from "next/navigation";
import { authenticatedApiFetch } from "@common/services/authenticated-api-fetch.service";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import {
  changePendingEmailSchema,
  confirmEmailSchema,
  emailVerificationIdentifierSchema,
} from "@features/institutional-auth/schemas/email-verification.schema";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import type { EmailVerificationState } from "@features/institutional-auth/types/email-verification-state.types";
import { setInstitutionalEmailVerifiedCookie } from "@features/institutional-auth/utils/institutional-auth-cookies.util";
import { clearEmailVerificationContext } from "@features/institutional-auth/utils/email-verification-context.util";

const FIELDS = ["institutionId", "documentNumber", "email", "password", "token"] as const;
const EMAIL_VERIFICATION_ENDPOINTS = {
  CHANGE_EMAIL: "/api/v1/auth/email-verification/change-email",
  CONFIRM: "/api/v1/auth/email-verification/confirm",
  RESEND: "/api/v1/auth/email-verification/resend",
} as const;

async function submit(endpoint: string, data: unknown, unauthorizedMessage?: string): Promise<EmailVerificationState> {
  let response: Response;

  try {
    response = await authenticatedApiFetch(endpoint, undefined, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.EMAIL_VERIFICATION_REQUEST_FAILED };
  }

  if (response.status === 401 && unauthorizedMessage) return { error: unauthorizedMessage };

  const error = await getResponseErrorActionState(response, FIELDS, INSTITUTIONAL_AUTH_ERROR_MESSAGES.EMAIL_VERIFICATION_REQUEST_FAILED);
  return error ?? { success: true };
}

export async function resendEmailVerification(_previous: EmailVerificationState, formData: FormData): Promise<EmailVerificationState> {
  const parsed = emailVerificationIdentifierSchema.safeParse({
    institutionId: formData.get("institutionId"),
    documentNumber: formData.get("documentNumber"),
  });
  if (!parsed.success) return getValidationActionState(parsed.error.issues, FIELDS);
  return submit(EMAIL_VERIFICATION_ENDPOINTS.RESEND, parsed.data);
}

export async function changePendingEmail(_previous: EmailVerificationState, formData: FormData): Promise<EmailVerificationState> {
  const parsed = changePendingEmailSchema.safeParse({
    institutionId: formData.get("institutionId"),
    documentNumber: formData.get("documentNumber"),
    password: formData.get("password"),
    email: formData.get("email"),
  });
  if (!parsed.success) return getValidationActionState(parsed.error.issues, FIELDS);
  return submit(EMAIL_VERIFICATION_ENDPOINTS.CHANGE_EMAIL, parsed.data, INSTITUTIONAL_AUTH_ERROR_MESSAGES.EMAIL_CHANGE_INVALID_CREDENTIALS);
}

export async function confirmEmailVerification(_previous: EmailVerificationState, formData: FormData): Promise<EmailVerificationState> {
  const parsed = confirmEmailSchema.safeParse({ token: formData.get("token") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const result = await submit(EMAIL_VERIFICATION_ENDPOINTS.CONFIRM, parsed.data);
  if (!result.success) return result;

  await clearEmailVerificationContext();
  await setInstitutionalEmailVerifiedCookie();
  redirect("/auth/login");
}
