"use client";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";

type AcademicOfferPaginationProps = {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export function AcademicOfferPagination({ page, size, totalItems, totalPages }: AcademicOfferPaginationProps): React.ReactElement {
  const { isPending, navigate } = useDataTableNavigation();
  const summaryLabel = totalItems === 1 ? "1 trayecto disponible." : `${totalItems} trayectos disponibles.`;

  return (
    <DataTablePagination
      isPending={isPending}
      onPageChange={(nextPage) => navigate({ page: String(nextPage), size: String(size) })}
      onPageSizeChange={(nextSize) => navigate({ page: "0", size: nextSize })}
      page={page}
      pageSizeLabel="Trayectos por página"
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      size={size}
      summaryLabel={summaryLabel}
      totalPages={totalPages}
    />
  );
}
