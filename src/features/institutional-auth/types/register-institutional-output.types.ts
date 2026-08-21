import type { BackendError } from "@common/types/backend-error.types";
import type { InstitutionalRegisterResult } from "@features/institutional-auth/types/institutional-register-result.types";

export type RegisterInstitutionalOutput = { success: true; data: InstitutionalRegisterResult } | { success: false; error: BackendError };
