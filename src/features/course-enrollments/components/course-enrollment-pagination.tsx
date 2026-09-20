"use client";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import type { PaginationParams } from "@common/types/pagination-params.types";
import { COURSE_ENROLLMENT_PAGE_SIZE_OPTIONS } from "@features/course-enrollments/utils/course-enrollment-pagination.util";

type CourseEnrollmentPaginationProps = PaginationParams & {
  totalItems: number;
  itemLabel?: string;
  totalPages: number;
};

export function CourseEnrollmentPagination({ page, size, totalItems, totalPages, itemLabel }: CourseEnrollmentPaginationProps): React.ReactElement {
  const { isPending, navigate } = useDataTableNavigation();

  function navigateToPage(newPage: number): void {
    navigate({ page: String(newPage), size: String(size) });
  }

  function updatePageSize(newSize: string): void {
    navigate({ page: "0", size: newSize });
  }

  const totalLabel = totalItems === 1 ? "cursada." : "cursadas.";
  const summaryLabel = `${totalItems} ${itemLabel ?? totalLabel}`;

  return (
    <DataTablePagination
      page={page}
      size={size}
      summaryLabel={summaryLabel}
      totalPages={totalPages}
      pageSizeOptions={COURSE_ENROLLMENT_PAGE_SIZE_OPTIONS}
      isPending={isPending}
      onPageChange={navigateToPage}
      onPageSizeChange={updatePageSize}
    />
  );
}
