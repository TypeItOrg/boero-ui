"use client";

import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import type { PaginationParams } from "@common/types/pagination-params.types";
import { SESSIONS_PAGE_SIZE_OPTIONS } from "@features/institutional-auth/utils/session-pagination.util";

type InstitutionalSessionsPaginationProps = PaginationParams & {
  totalItems: number;
  totalPages: number;
  isPending: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: string) => void;
};

export function InstitutionalSessionsPagination({
  page,
  size,
  totalItems,
  totalPages,
  isPending,
  onPageChange,
  onPageSizeChange,
}: InstitutionalSessionsPaginationProps): React.ReactElement {
  return (
    <DataTablePagination
      page={page}
      size={size}
      summaryLabel={`${totalItems} ${totalItems === 1 ? "sesión" : "sesiones"}.`}
      totalPages={totalPages}
      pageSizeOptions={SESSIONS_PAGE_SIZE_OPTIONS}
      isPending={isPending}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
