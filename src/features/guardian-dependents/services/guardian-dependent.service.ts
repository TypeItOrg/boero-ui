import "server-only";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { GUARDIAN_DEPENDENT_MESSAGES, getGuardianDependentsApiPath } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function fetchGuardianDependents(institutionId: string): Promise<GuardianDependent[]> {
  const response = await institutionalApiFetch(getGuardianDependentsApiPath(institutionId));

  return parseHttpResponse(response, GUARDIAN_DEPENDENT_MESSAGES.FETCH);
}
