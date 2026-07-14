"use client";

import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import type { PaginationParams } from "@common/types/pagination.types";
import { INSTITUTION_PAGE_SIZE_OPTIONS } from "@features/institutions/utils/institution-pagination.util";

type PaginationProps = PaginationParams & {
  totalItems: number;
  totalPages: number;
  isPending: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: string) => void;
};

export function InstitutionsPagination({
  page,
  size,
  totalItems,
  totalPages,
  isPending,
  onPageChange,
  onPageSizeChange,
}: PaginationProps): React.ReactElement {
  const institutionLabel = totalItems === 1 ? "institución registrada." : "instituciones registradas.";
  const summaryLabel = `${totalItems} ${institutionLabel}`;

  return (
    <DataTablePagination
      page={page}
      size={size}
      summaryLabel={summaryLabel}
      totalPages={totalPages}
      pageSizeOptions={INSTITUTION_PAGE_SIZE_OPTIONS}
      isPending={isPending}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
