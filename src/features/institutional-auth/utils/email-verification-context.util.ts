import "server-only";
import { cookies } from "next/headers";
import { emailVerificationContextSchema } from "@features/institutional-auth/schemas/email-verification.schema";
import type { EmailVerificationContext } from "@features/institutional-auth/types/email-verification-context.types";
import { getInstitutionalAuthCookieOptions } from "@features/institutional-auth/utils/institutional-auth-cookies.util";

const COOKIE = "institutional_email_verification_context";

// Navigation context only: every mutation validates identity and credentials again in the API.
export async function setEmailVerificationContext(context: EmailVerificationContext): Promise<void> {
  const parsed = emailVerificationContextSchema.parse(context);
  (await cookies()).set(COOKIE, JSON.stringify(parsed), getInstitutionalAuthCookieOptions(15 * 60));
}
export async function getEmailVerificationContext(): Promise<EmailVerificationContext | undefined> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return undefined;
  try {
    const parsed = emailVerificationContextSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}
export async function clearEmailVerificationContext(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
