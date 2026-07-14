import { PlatformAccountsTablePresentation } from "@features/platform-accounts/components/platform-accounts-table-presentation";
import { fetchPlatformAccounts } from "@features/platform-accounts/services/fetch-platform-accounts.service";
import type { PlatformAccountPaginationParams } from "@features/platform-accounts/utils/platform-account-pagination.util";

export async function PlatformAccountsTableContainer(
  params: PlatformAccountPaginationParams,
): Promise<React.ReactElement> {
  const data = await fetchPlatformAccounts(params);
  const { page, size, sort, search, enabled } = params;

  return (
    <PlatformAccountsTablePresentation
      key={`${page}-${size}`}
      data={data}
      page={page}
      size={size}
      sort={sort}
      search={search}
      enabled={enabled}
    />
  );
}
