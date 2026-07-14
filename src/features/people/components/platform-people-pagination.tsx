"use client";

import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import type { PaginationParams } from "@common/types/pagination.types";
import { PLATFORM_PEOPLE_PAGE_SIZE_OPTIONS } from "@features/people/utils/platform-people-pagination.util";

type PlatformPeoplePaginationProps = PaginationParams & {
  isPending: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: string) => void;
  totalItems: number;
  totalPages: number;
};

export function PlatformPeoplePagination({
  page,
  size,
  isPending,
  onPageChange,
  onPageSizeChange,
  totalItems,
  totalPages,
}: PlatformPeoplePaginationProps): React.ReactElement {
  const userLabel = totalItems === 1 ? "usuario registrado." : "usuarios registrados.";

  return (
    <DataTablePagination
      page={page}
      size={size}
      summaryLabel={`${totalItems} ${userLabel}`}
      totalPages={totalPages}
      pageSizeOptions={PLATFORM_PEOPLE_PAGE_SIZE_OPTIONS}
      isPending={isPending}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
