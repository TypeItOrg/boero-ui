import "server-only";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";

import { GUARDIAN_DEPENDENT_MESSAGES, getGuardianDependentsApiPath } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import type { GuardianDependentsQuery } from "@features/guardian-dependents/types/guardian-dependents-query.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function fetchGuardianDependents(institutionId: string): Promise<GuardianDependent[]> {
  const response = await institutionalApiFetch(getGuardianDependentsApiPath(institutionId));

  return parseHttpResponse(response, GUARDIAN_DEPENDENT_MESSAGES.FETCH);
}

export async function fetchGuardianDependentsPage(
  institutionId: string,
  query: GuardianDependentsQuery,
): Promise<PaginatedResponse<GuardianDependent>> {
  const params = buildPaginationSearchParams(query);

  params.set("sortField", query.sort.field);
  params.set("sortDirection", query.sort.direction);

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.relationship) {
    params.set("relationship", query.relationship);
  }

  if (query.primaryContact !== undefined) {
    params.set("primaryContact", String(query.primaryContact));
  }

  const response = await institutionalApiFetch(`${getGuardianDependentsApiPath(institutionId)}/page?${params.toString()}`);

  return parseHttpResponse(response, GUARDIAN_DEPENDENT_MESSAGES.FETCH);
}
