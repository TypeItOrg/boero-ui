"use client";

import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import type { PaginationParams } from "@common/types/pagination.types";
import { PLATFORM_ROLES_PAGE_SIZE_OPTIONS } from "@features/roles/utils/platform-role-pagination.util";

type PlatformRolesPaginationProps = PaginationParams & {
  isPending: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: string) => void;
  totalItems: number;
  totalPages: number;
};

export function PlatformRolesPagination({
  page,
  size,
  isPending,
  onPageChange,
  onPageSizeChange,
  totalItems,
  totalPages,
}: PlatformRolesPaginationProps): React.ReactElement {
  return (
    <DataTablePagination
      page={page}
      size={size}
      summaryLabel={`${totalItems} ${totalItems === 1 ? "rol registrado." : "roles registrados."}`}
      totalPages={totalPages}
      pageSizeOptions={PLATFORM_ROLES_PAGE_SIZE_OPTIONS}
      isPending={isPending}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
