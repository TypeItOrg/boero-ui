"use client";

import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";

type InstitutionRolesPaginationProps = {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export function InstitutionRolesPagination({
  page,
  size,
  totalItems,
  totalPages,
}: InstitutionRolesPaginationProps): React.ReactElement {
  const { isPending, navigate } = useDataTableNavigation();
  return (
    <DataTablePagination
      page={page}
      size={size}
      totalPages={totalPages}
      summaryLabel={`${totalItems} ${totalItems === 1 ? "rol registrado." : "roles registrados."}`}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      isPending={isPending}
      onPageChange={(nextPage) => navigate({ page: String(nextPage) })}
      onPageSizeChange={(nextSize) => navigate({ page: "0", size: nextSize })}
    />
  );
}
