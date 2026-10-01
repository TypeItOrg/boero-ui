"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationQuery } from "@common/types/pagination-query.types";
import { TeachersPagination } from "@features/people/components/teachers-pagination";
import { TeachersTableEmptyState } from "@features/people/components/teachers-table-empty-state";
import { TeachersTableRow } from "@features/people/components/teachers-table-row";
import type { PersonSummary } from "@features/people/types/person-summary.types";
import type { TeachersSort, TeachersSortField } from "@features/people/utils/teachers-pagination.util";

type TeachersTablePresentationProps = PaginationQuery & {
  data: PaginatedResponse<PersonSummary>;
  sort: TeachersSort;
};

export function TeachersTablePresentation({ data, page, size, search, sort }: TeachersTablePresentationProps): React.ReactElement {
  const { isPending: isNavigating, navigate } = useDataTableNavigation();

  if (data.items.length === 0) {
    return <TeachersTableEmptyState isNavigating={isNavigating} search={search} size={size} totalItems={data.totalItems} />;
  }

  function updateSort(nextSort: TeachersSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isNavigating}>
        <Table containerClassName="table-scrollbar" className="min-w-190">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted h-11 border-b transition-colors">
              <DataTableSortableHead<TeachersSortField> field="lastName" label="Nombre" sort={sort} onSortChange={updateSort} />
              <DataTableSortableHead<TeachersSortField> field="documentNumber" label="Documento" sort={sort} onSortChange={updateSort} />
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((teacher) => (
              <TeachersTableRow key={teacher.id} teacher={teacher} />
            ))}
          </TableBody>
        </Table>

        {isNavigating ? (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando docentes" role="status" />
          </div>
        ) : null}
      </div>
      <TeachersPagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} />
    </div>
  );
}
