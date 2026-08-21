"use client";

import { DataTableNavigationProvider, useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { getAcademicRegistrationSummary, ACADEMIC_PAGE_SIZE_OPTIONS } from "@features/academic/utils/academic-pagination.util";

type AcademicSpaceUsagePaginationProps = {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export function AcademicSpaceUsagePagination(props: AcademicSpaceUsagePaginationProps): React.ReactElement {
  return (
    <DataTableNavigationProvider>
      <AcademicSpaceUsagePaginationControls {...props} />
    </DataTableNavigationProvider>
  );
}

function AcademicSpaceUsagePaginationControls({ page, size, totalItems, totalPages }: AcademicSpaceUsagePaginationProps): React.ReactElement {
  const { isPending, navigate } = useDataTableNavigation();

  return (
    <DataTablePagination
      page={page}
      size={size}
      totalPages={totalPages}
      pageSizeOptions={ACADEMIC_PAGE_SIZE_OPTIONS}
      summaryLabel={getAcademicRegistrationSummary(totalItems, "plan asociado", "planes asociados")}
      isPending={isPending}
      pageSizeLabel="Planes por página"
      pageSizeCompactLabel="Planes"
      onPageChange={(nextPage) => navigate({ usagePage: String(nextPage) }, { scroll: false })}
      onPageSizeChange={(nextSize) => navigate({ usagePage: "0", usageSize: nextSize }, { replace: true, scroll: false })}
    />
  );
}
