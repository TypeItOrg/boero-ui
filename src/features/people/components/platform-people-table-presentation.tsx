"use client";

import { Loader2Icon } from "lucide-react";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";
import { PlatformPeopleEmptyState } from "@features/people/components/platform-people-table-empty-state";
import { PlatformPeoplePagination } from "@features/people/components/platform-people-pagination";
import { PlatformPeopleTableRow } from "@features/people/components/platform-people-table-row";
import type { PlatformPersonSummary } from "@features/people/types/platform-person-summary.types";
import type { SystemRoleCode } from "@features/people/types/system-role-code.types";
import type {
  PlatformPeopleSort,
  PlatformPeopleSortField,
} from "@features/people/utils/platform-people-pagination.util";

type PlatformPeopleTablePresentationProps = PaginationParams & {
  data: PaginatedResponse<PlatformPersonSummary>;
  institutionId: string | undefined;
  roleCode: SystemRoleCode | undefined;
  search: string;
  sort: PlatformPeopleSort;
  canUpdate?: boolean;
};

export function PlatformPeopleTablePresentation({
  data,
  page,
  size,
  institutionId,
  roleCode,
  search,
  sort,
  canUpdate = true,
}: PlatformPeopleTablePresentationProps): React.ReactElement {
  const { isPending, navigate } = useDataTableNavigation();

  function updateSort(nextSort: PlatformPeopleSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  if (data.items.length === 0) {
    return (
      <div className="relative h-full" aria-busy={isPending}>
        <PlatformPeopleEmptyState
          data={data}
          hasFilters={search.trim() !== "" || institutionId !== undefined || roleCode !== undefined}
          onFirstPage={() => navigate({ page: "0", size: String(size) })}
        />
        {isPending ? (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
            <Loader2Icon
              className="text-muted-foreground size-5 animate-spin"
              aria-label="Cargando usuarios"
              role="status"
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isPending}>
        <Table containerClassName="table-scrollbar" className="min-w-260">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="h-11">
              <DataTableSortableHead<PlatformPeopleSortField>
                field="lastName"
                label="Nombre"
                sort={sort}
                onSortChange={updateSort}
              />
              <DataTableSortableHead<PlatformPeopleSortField>
                field="documentNumber"
                label="Documento"
                sort={sort}
                onSortChange={updateSort}
              />
              <DataTableSortableHead<PlatformPeopleSortField>
                field="institutionName"
                label="Institución"
                sort={sort}
                onSortChange={updateSort}
              />
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="w-16 pr-4">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((person) => (
              <PlatformPeopleTableRow key={person.id} canUpdate={canUpdate} person={person} />
            ))}
          </TableBody>
        </Table>

        {isPending ? (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2Icon
              className="text-muted-foreground size-5 animate-spin"
              aria-label="Cargando usuarios"
              role="status"
            />
          </div>
        ) : null}
      </div>

      <PlatformPeoplePagination
        page={page}
        size={size}
        totalItems={data.totalItems}
        totalPages={data.totalPages}
        isPending={isPending}
        onPageChange={(nextPage) => navigate({ page: String(nextPage), size: String(size) })}
        onPageSizeChange={(nextSize) => navigate({ page: "0", size: nextSize })}
      />
    </div>
  );
}
