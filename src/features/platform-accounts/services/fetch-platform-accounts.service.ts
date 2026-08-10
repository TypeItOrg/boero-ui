import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account-admin.types";
import type { PlatformAccountPaginationParams } from "@features/platform-accounts/utils/platform-account-pagination.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { PLATFORM_ACCOUNT_ERROR_MESSAGES } from "@features/platform-accounts/constants/error-messages.constants";

export async function fetchPlatformAccounts({
  page,
  size,
  search,
  enabled,
  sort,
}: PlatformAccountPaginationParams): Promise<PaginatedResponse<PlatformAccountAdmin>> {
  const searchParams = buildPaginationSearchParams({ page, size, search });
  searchParams.set("sort", serializeSpringSort(sort));

  if (enabled !== undefined) {
    searchParams.set("enabled", String(enabled));
  }

  const response = await platformApiFetch(`/api/v1/admin/accounts?${searchParams.toString()}`);
  return parseHttpResponse(response, PLATFORM_ACCOUNT_ERROR_MESSAGES.FETCH_ACCOUNTS);
}
