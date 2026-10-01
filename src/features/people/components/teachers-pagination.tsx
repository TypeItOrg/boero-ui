"use client";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import type { PaginationParams } from "@common/types/pagination-params.types";
import { TEACHERS_PAGE_SIZE_OPTIONS } from "@features/people/utils/teachers-pagination.util";

type TeachersPaginationProps = PaginationParams & {
  totalItems: number;
  totalPages: number;
};

export function TeachersPagination({ page, size, totalItems, totalPages }: TeachersPaginationProps): React.ReactElement {
  const { isPending, navigate } = useDataTableNavigation();
  const summaryLabel = totalItems === 1 ? "1 docente registrado." : `${totalItems} docentes registrados.`;

  return (
    <DataTablePagination
      page={page}
      size={size}
      summaryLabel={summaryLabel}
      totalPages={totalPages}
      pageSizeOptions={TEACHERS_PAGE_SIZE_OPTIONS}
      isPending={isPending}
      onPageChange={(newPage) => navigate({ page: String(newPage), size: String(size) })}
      onPageSizeChange={(newSize) => navigate({ page: "0", size: newSize })}
    />
  );
}
