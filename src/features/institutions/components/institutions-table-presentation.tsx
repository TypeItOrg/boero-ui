"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";
import { InstitutionsTableEmptyState } from "@features/institutions/components/institutions-table-empty-state";
import { InstitutionsTableRow } from "@features/institutions/components/institutions-table-row";
import { InstitutionsPagination } from "@features/institutions/components/institutions-pagination";
import { InstitutionStatusDialog } from "@features/institutions/components/institution-status-dialog";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";
import type { InstitutionSort, InstitutionSortField } from "@features/institutions/utils/institution-pagination.util";

type InstitutionsTablePresentationProps = PaginationParams & {
  data: PaginatedResponse<InstitutionSummary>;
  sort: InstitutionSort;
  search: string;
  active: boolean | undefined;
};

export function InstitutionsTablePresentation({ data, page, size, sort, search, active }: InstitutionsTablePresentationProps): React.ReactElement {
  const router = useRouter();
  const { isPending: isNavigating, navigate } = useDataTableNavigation();
  const [statusTargetInstitution, setStatusTargetInstitution] = useState<InstitutionSummary>();

  function navigateToPage(newPage: number): void {
    navigate({ page: String(newPage), size: String(size) });
  }

  function updatePageSize(newSize: string): void {
    navigate({ page: "0", size: newSize });
  }

  function updateSort(nextSort: InstitutionSort): void {
    navigate({ page: "0", sortField: nextSort.field, sortDirection: nextSort.direction });
  }

  if (data.items.length === 0) {
    return <InstitutionsTableEmptyState active={active} isNavigating={isNavigating} search={search} size={size} totalItems={data.totalItems} />;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isNavigating}>
        <Table containerClassName="table-scrollbar" className="min-w-240">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="hover:bg-muted/50 border-b transition-colors">
              <DataTableSortableHead<InstitutionSortField> field="name" label="Nombre" sort={sort} onSortChange={updateSort} />
              <TableHead>País</TableHead>
              <TableHead>Provincia</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Usuarios</TableHead>
              <DataTableSortableHead<InstitutionSortField>
                field="active"
                label="Estado"
                sort={sort}
                defaultDirection="desc"
                onSortChange={updateSort}
              />
              <TableHead className="w-16 pr-4">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((institution) => (
              <InstitutionsTableRow key={institution.id} institution={institution} onStatusChange={setStatusTargetInstitution} />
            ))}
          </TableBody>
        </Table>
        {isNavigating && (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando instituciones" role="status" />
          </div>
        )}
      </div>

      <InstitutionsPagination
        page={page}
        size={size}
        totalItems={data.totalItems}
        totalPages={data.totalPages}
        isPending={isNavigating}
        onPageChange={navigateToPage}
        onPageSizeChange={updatePageSize}
      />

      {statusTargetInstitution ? (
        <InstitutionStatusDialog
          institutionId={statusTargetInstitution.id}
          institutionName={statusTargetInstitution.name}
          active={statusTargetInstitution.active}
          open={Boolean(statusTargetInstitution)}
          onOpenChange={(open) => {
            if (!open) setStatusTargetInstitution(undefined);
          }}
          onUpdated={() => {
            const nextActive = !statusTargetInstitution.active;
            toast.success(`${statusTargetInstitution.name} fue ${nextActive ? "activada" : "desactivada"}.`);
            setStatusTargetInstitution(undefined);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
