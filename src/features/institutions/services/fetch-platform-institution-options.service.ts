import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { toAsyncDropdownPage } from "@common/utils/to-async-dropdown-page.util";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";

export async function fetchPlatformInstitutionOptions(
  { page, search, signal, size }: AsyncDropdownFetchPageInput,
  active?: boolean,
): Promise<AsyncDropdownPage<InstitutionSummary>> {
  const params = buildPaginationSearchParams({ page, size, search });
  if (active !== undefined) params.set("active", String(active));
  params.set("sort", serializeSpringSort({ field: "name", direction: "asc" }));
  const response = await fetch(`/api/admin/institutions?${params.toString()}`, { signal });
  const data = await parseHttpResponse<PaginatedResponse<InstitutionSummary>>(response, INSTITUTION_ERROR_MESSAGES.FETCH_INSTITUTIONS);
  return toAsyncDropdownPage(data);
}

export function fetchActivePlatformInstitutionOptions(input: AsyncDropdownFetchPageInput): Promise<AsyncDropdownPage<InstitutionSummary>> {
  return fetchPlatformInstitutionOptions(input, true);
}
