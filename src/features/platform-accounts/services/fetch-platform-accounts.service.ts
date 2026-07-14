import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { buildPaginationSearchParams } from "@common/utils/pagination-query.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { createHttpError } from "@common/utils/create-http-error.util";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account.types";
import type { PlatformAccountPaginationParams } from "@features/platform-accounts/utils/platform-account-pagination.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

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

  const response = await platformApiFetch(`/api/v1/platform/accounts?${searchParams.toString()}`);
  if (!response.ok) {
    throw createHttpError("No se pudieron obtener los administradores", response.status);
  }

  return response.json();
}
