"use client";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import type { PaginationParams } from "@common/types/pagination-params.types";
import { ENROLLMENT_APPLICATION_PAGE_SIZE_OPTIONS } from "../utils/enrollment-application-pagination.util";

type EnrollmentApplicationPaginationProps = PaginationParams & {
  totalItems: number;
  totalPages: number;
};

export function EnrollmentApplicationPagination({ page, size, totalItems, totalPages }: EnrollmentApplicationPaginationProps): React.ReactElement {
  const { isPending, navigate } = useDataTableNavigation();

  function navigateToPage(newPage: number): void {
    navigate({ page: String(newPage), size: String(size) });
  }

  function updatePageSize(newSize: string): void {
    navigate({ page: "0", size: newSize });
  }

  const totalLabel = totalItems === 1 ? "solicitud de inscripción." : "solicitudes de inscripción.";
  const summaryLabel = `${totalItems} ${totalLabel}`;

  return (
    <DataTablePagination
      page={page}
      size={size}
      summaryLabel={summaryLabel}
      totalPages={totalPages}
      pageSizeOptions={ENROLLMENT_APPLICATION_PAGE_SIZE_OPTIONS}
      isPending={isPending}
      onPageChange={navigateToPage}
      onPageSizeChange={updatePageSize}
    />
  );
}
