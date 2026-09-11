import type { BackendError } from "@common/types/backend-error.types";
import type { InstitutionalLoginResult } from "@features/institutional-auth/types/institutional-login-result.types";

export type PasswordLoginInstitutionalOutput = { success: true; data: InstitutionalLoginResult } | { success: false; error: BackendError };
