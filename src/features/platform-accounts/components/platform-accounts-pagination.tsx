"use client";

import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import type { PaginationParams } from "@common/types/pagination.types";
import { PLATFORM_ACCOUNT_PAGE_SIZE_OPTIONS } from "@features/platform-accounts/utils/platform-account-pagination.util";

type PlatformAccountsPaginationProps = PaginationParams & {
  totalItems: number;
  totalPages: number;
  isPending: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: string) => void;
};

export function PlatformAccountsPagination({
  page,
  size,
  totalItems,
  totalPages,
  isPending,
  onPageChange,
  onPageSizeChange,
}: PlatformAccountsPaginationProps): React.ReactElement {
  const label = totalItems === 1 ? "administrador" : "administradores";

  return (
    <DataTablePagination
      page={page}
      size={size}
      summaryLabel={`${totalItems} ${label}.`}
      totalPages={totalPages}
      pageSizeOptions={PLATFORM_ACCOUNT_PAGE_SIZE_OPTIONS}
      isPending={isPending}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
