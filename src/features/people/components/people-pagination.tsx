"use client";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import type { PaginationParams } from "@common/types/pagination.types";
import { PEOPLE_PAGE_SIZE_OPTIONS } from "@features/people/utils/people-pagination.util";

type PeoplePaginationProps = PaginationParams & {
  totalItems: number;
  totalPages: number;
};

export function PeoplePagination({ page, size, totalItems, totalPages }: PeoplePaginationProps): React.ReactElement {
  const { isPending, navigate } = useDataTableNavigation();

  function navigateToPage(newPage: number): void {
    navigate({ page: String(newPage), size: String(size) });
  }

  function updatePageSize(newSize: string): void {
    navigate({ page: "0", size: newSize });
  }

  const totalLabel = totalItems === 1 ? "usuario registrado." : "usuarios registrados.";
  const summaryLabel = `${totalItems} ${totalLabel}`;

  return (
    <DataTablePagination
      page={page}
      size={size}
      summaryLabel={summaryLabel}
      totalPages={totalPages}
      pageSizeOptions={PEOPLE_PAGE_SIZE_OPTIONS}
      isPending={isPending}
      onPageChange={navigateToPage}
      onPageSizeChange={updatePageSize}
    />
  );
}
