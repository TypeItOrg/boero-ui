import type { BackendError } from "@common/types/backend-error.types";
import type { InstitutionalIdentifyResult } from "@features/institutional-auth/types/institutional-identify-result.types";

export type IdentifyInstitutionalOutput = { success: true; data: InstitutionalIdentifyResult } | { success: false; error: BackendError };
