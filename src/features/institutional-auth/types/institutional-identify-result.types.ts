import type { InstitutionalLoginAttempt } from "@features/institutional-auth/types/institutional-login-attempt.types";

export type InstitutionalIdentifyResult = InstitutionalLoginAttempt | { loginAttemptId: null; nextStep: "EMAIL_VERIFICATION" };
