"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { CircleAlertIcon, GitBranchPlusIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { Skeleton } from "@common/components/ui/skeleton";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";

import { FormField } from "@features/academic/components/academic-form-controls";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { AssignmentFields } from "@features/document-catalog/components/document-assignment-fields";
import { DocumentCatalogAssignmentsEmptyState } from "@features/document-catalog/components/document-catalog-assignments-empty-state";
import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";

export function DocumentCatalogAssignmentSection({
  associationsLoading,
  scope,
  assignmentInstitutionId,
  disabled,
  rows,
  removePath,
  selectPath,
  readError,
  setChanges,
  page,
  associations,
  totalItems,
  setAssociationsLoading,
  setPage,
  currentId,
  totalPages,
  pageSize,
  setPageSize,
}: {
  associationsLoading: boolean;
  scope: AcademicScope;
  assignmentInstitutionId: string | undefined;
  disabled: boolean;
  rows: DocumentAssignment[];
  removePath: (item: DocumentAssignment) => void;
  selectPath: (item: { id: string; name: string }) => Promise<void>;
  readError: string;
  setChanges: Dispatch<SetStateAction<Record<string, DocumentAssignment>>>;
  page: number;
  associations: PaginatedResponse<DocumentAssignment> | undefined;
  totalItems: number;
  setAssociationsLoading: Dispatch<SetStateAction<boolean>>;
  setPage: Dispatch<SetStateAction<number>>;
  currentId: string | undefined;
  totalPages: number;
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
}): ReactElement {
  return (
    <section className="bg-muted/25 min-w-0 rounded-xl border p-4 sm:p-6" aria-label="Trayectos asociados" aria-busy={associationsLoading}>
      <header className="-mx-4 border-b px-4 pb-4 sm:-mx-6 sm:px-6 sm:pb-5">
        <SectionHeader
          icon={GitBranchPlusIcon}
          title="Trayectos asignados"
          description="Agregá o quitá trayectos y configurá sus requisitos. Los cambios se aplican al guardar."
        />
      </header>
      <div className="mt-5 space-y-5">
        <FormField name="catalog-training-path" label="Agregar trayecto">
          <AsyncDropdown<{ id: string; name: string }>
            key={`${scope}:${assignmentInstitutionId ?? ""}`}
            id="catalog-training-path"
            disabled={disabled || !assignmentInstitutionId}
            closeOnSelect={false}
            selectedValues={rows.filter((item) => item.active).map((item) => item.trainingPathId)}
            placeholder="Buscar trayecto para agregar"
            queryKey={["catalog-paths", scope, assignmentInstitutionId]}
            fetchPage={(input) => {
              if (!assignmentInstitutionId) {
                return Promise.resolve({ items: [], nextPage: null });
              }

              return fetchAcademicOptionPage("training-paths", scope, assignmentInstitutionId, input);
            }}
            getItemValue={(item) => item.id}
            getItemLabel={(item) => item.name}
            onValueChange={(_, item) => {
              if (!item) {
                return;
              }

              const assignment = rows.find((row) => row.trainingPathId === item.id);

              if (assignment?.active) {
                removePath(assignment);

                return;
              }

              void selectPath(item);
            }}
          />
        </FormField>
        {readError ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{readError}</AlertDescription>
          </Alert>
        ) : null}
      </div>
      {associationsLoading ? (
        <Skeleton className="mt-5 h-32" role="status" aria-label="Cargando asignaciones por trayecto" />
      ) : rows.length > 0 ? (
        <div className="mt-5 space-y-6">
          {rows.map((item) => (
            <AssignmentFields
              key={item.trainingPathId}
              item={item}
              disabled={disabled}
              onChange={(value) => setChanges((previous) => ({ ...previous, [value.trainingPathId]: value }))}
              onRemove={() => {
                removePath(item);
                document.getElementById("catalog-training-path")?.focus();
              }}
            />
          ))}
        </div>
      ) : !readError && page > 0 && associations?.items.length === 0 && totalItems > 0 ? (
        <DocumentCatalogAssignmentsEmptyState
          hasItemsOnOtherPages
          onFirstPage={() => {
            setAssociationsLoading(true);
            setPage(0);
          }}
        />
      ) : null}
      {currentId && totalPages > 1 ? (
        <div className="mt-5">
          <DataTablePagination
            page={page}
            size={pageSize}
            totalPages={totalPages}
            summaryLabel={`${totalItems} trayectos asociados.`}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            isPending={disabled || associationsLoading}
            onPageChange={(value) => {
              setAssociationsLoading(true);
              setPage(value);
            }}
            onPageSizeChange={(value) => {
              setAssociationsLoading(true);
              setPageSize(Number(value));
              setPage(0);
            }}
          />
        </div>
      ) : null}
    </section>
  );
}
