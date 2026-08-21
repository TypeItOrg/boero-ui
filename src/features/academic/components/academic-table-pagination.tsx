"use client";

import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import type { PaginationParams } from "@common/types/pagination-params.types";
import { ACADEMIC_PAGE_SIZE_OPTIONS, getAcademicRegistrationSummary } from "@features/academic/utils/academic-pagination.util";

type AcademicTablePaginationProps = PaginationParams & {
  isPending: boolean;
  plural: string;
  singular: string;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: string) => void;
};

export function AcademicTablePagination({
  page,
  size,
  isPending,
  plural,
  singular,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: AcademicTablePaginationProps): React.ReactElement {
  return (
    <DataTablePagination
      page={page}
      size={size}
      summaryLabel={getAcademicRegistrationSummary(totalItems, singular, plural)}
      totalPages={totalPages}
      pageSizeOptions={ACADEMIC_PAGE_SIZE_OPTIONS}
      isPending={isPending}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
