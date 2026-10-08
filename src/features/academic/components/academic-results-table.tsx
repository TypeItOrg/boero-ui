"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { DataTableSortableHead } from "@common/components/ui/data-table-sortable-head";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";

import { AcademicTableRow } from "@features/academic/components/academic-table-row";
import { type AcademicLifecycleActionKind } from "@features/academic/types/academic-lifecycle-action-kind.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicStatusSelection } from "@features/academic/types/academic-status-selection.types";
import type { AcademicTableColumns } from "@features/academic/types/academic-table-columns.types";
import type { AcademicTableRow as AcademicTableRowData } from "@features/academic/types/academic-table-row.types";
import type { AcademicSort, AcademicSortField } from "@features/academic/utils/academic-pagination.util";

export function AcademicResultsTable({
  columns,
  global,
  sort,
  updateSort,
  data,
  basePath,
  canChangeStatus,
  canDelete,
  canCreateVersion,
  canReadWaitlist,
  canRestore,
  canUpdate,
  setLifecycleAction,
  getInstitutionId,
  setStatusAction,
  resource,
}: {
  columns: AcademicTableColumns;
  global: boolean;
  sort: AcademicSort;
  updateSort: (nextSort: AcademicSort) => void;
  data: PaginatedResponse<AcademicTableRowData>;
  basePath: string;
  canChangeStatus: boolean;
  canDelete: boolean;
  canCreateVersion: boolean;
  canReadWaitlist: boolean;
  canRestore: boolean;
  canUpdate: boolean;
  setLifecycleAction: Dispatch<SetStateAction<{ id: string; kind: AcademicLifecycleActionKind; label: string; institutionId: string } | undefined>>;
  getInstitutionId: (rowId: string) => string;
  setStatusAction: Dispatch<SetStateAction<{ institutionId: string; selection: AcademicStatusSelection } | undefined>>;
  resource:
    | AcademicResource.ACADEMIC_YEAR
    | AcademicResource.TRAINING_PATH
    | AcademicResource.STUDY_PLAN
    | AcademicResource.ACADEMIC_SPACE
    | AcademicResource.INSTRUMENT
    | AcademicResource.COURSE
    | AcademicResource.SHIFT;
}): ReactElement {
  return (
    <Table containerClassName="table-scrollbar" className={columns.detailLabels.length > 1 ? "min-w-220" : "min-w-180"}>
      <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
        <TableRow>
          <TableHead className="w-16 pl-4">
            <span className="sr-only">Acciones</span>
          </TableHead>
          {global ? <TableHead>Institución</TableHead> : null}
          {[columns.primaryLabel, ...columns.detailLabels].map((label, index) => {
            const field = columns.sortableFields?.[index];

            if (field) {
              return (
                <DataTableSortableHead<AcademicSortField>
                  key={`${label}-${index}`}
                  field={field}
                  label={label}
                  sort={sort}
                  onSortChange={updateSort}
                />
              );
            }

            return <TableHead key={`${label}-${index}`}>{label}</TableHead>;
          })}
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.items.map((row) => (
          <AcademicTableRow
            key={row.id}
            basePath={global ? `/admin/institutions/${row.institutionId}/academic` : basePath}
            canChangeStatus={canChangeStatus && (row.scopedActions?.status ?? true)}
            canDelete={canDelete && (row.scopedActions?.delete ?? true)}
            canCreateVersion={canCreateVersion && (row.scopedActions?.createVersion ?? true)}
            canReadWaitlist={canReadWaitlist && (row.scopedActions?.waitlist ?? true)}
            canRestore={canRestore && (row.scopedActions?.restore ?? true)}
            canUpdate={canUpdate && (row.scopedActions?.update ?? true)}
            columns={columns}
            global={global}
            onLifecycleAction={(id, label, kind) => {
              setLifecycleAction({ id, institutionId: getInstitutionId(id), kind, label });
            }}
            onStatusAction={(selection) => {
              setStatusAction({ institutionId: getInstitutionId(selection.id), selection });
            }}
            resource={resource}
            row={row}
          />
        ))}
      </TableBody>
    </Table>
  );
}
