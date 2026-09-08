"use client";

import * as React from "react";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import type { PaginationParams } from "@common/types/pagination-params.types";

const ENROLLMENTS_PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;

interface EnrollmentsPaginationProps extends PaginationParams {
  totalItems: number;
  totalPages: number;
}

export function EnrollmentsPagination({ page, size, totalItems, totalPages }: EnrollmentsPaginationProps): React.ReactElement {
  const { isPending, navigate } = useDataTableNavigation();

  function navigateToPage(newPage: number): void {
    navigate({ page: String(newPage), size: String(size) });
  }

  function updatePageSize(newSize: string): void {
    navigate({ page: "0", size: newSize });
  }

  const label = totalItems === 1 ? "inscripción registrada." : "inscripciones registradas.";
  const summaryLabel = `${totalItems} ${label}`;

  return (
    <DataTablePagination
      page={page}
      size={size}
      summaryLabel={summaryLabel}
      totalPages={totalPages}
      pageSizeOptions={ENROLLMENTS_PAGE_SIZE_OPTIONS}
      isPending={isPending}
      onPageChange={navigateToPage}
      onPageSizeChange={updatePageSize}
    />
  );
}
