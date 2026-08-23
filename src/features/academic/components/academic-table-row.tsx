import * as React from "react";
import Link from "next/link";

import { Badge } from "@common/components/ui/badge";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { TableCell, TableRow } from "@common/components/ui/table";
import { AcademicContextMenuActions, AcademicRowActions } from "@features/academic/components/academic-row-actions";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicLifecycleActionKind } from "@features/academic/types/academic-lifecycle-action-kind.types";
import { ACADEMIC_ROW_ACTION_KIND } from "@features/academic/types/academic-row-action-kind.types";
import type { AcademicRowAction } from "@features/academic/types/academic-row-action.types";
import type { AcademicStatusSelection } from "@features/academic/types/academic-status-selection.types";
import type { AcademicTableColumns } from "@features/academic/types/academic-table-columns.types";
import type { AcademicTableRow as AcademicTableRowData } from "@features/academic/types/academic-table-row.types";
import { getAcademicRowActions } from "@features/academic/utils/academic-row-actions.util";

type AcademicStatusAction = Extract<AcademicRowAction, { kind: typeof ACADEMIC_ROW_ACTION_KIND.STATUS }>;

type AcademicTableRowProps = {
  basePath: string;
  canChangeStatus: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canUpdate: boolean;
  columns: AcademicTableColumns;
  global?: boolean;
  onLifecycleAction: (id: string, itemLabel: string, kind: AcademicLifecycleActionKind) => void;
  onStatusAction: (selection: AcademicStatusSelection) => void;
  resource: AcademicCollectionResource;
  row: AcademicTableRowData;
};

export function AcademicTableRow({
  basePath,
  canChangeStatus,
  canDelete,
  canRestore,
  canUpdate,
  columns,
  global = false,
  onLifecycleAction,
  onStatusAction,
  resource,
  row,
}: AcademicTableRowProps): React.ReactElement {
  const institutionId = row.institutionId ?? "";
  const detailHref = `${basePath}/${resource}/${row.id}`;
  const actions = getAcademicRowActions(basePath, resource, row, canUpdate, canChangeStatus, canDelete, canRestore);

  function handleStatusAction(action: AcademicStatusAction): void {
    if (action.resource === AcademicResource.ACADEMIC_YEAR) {
      onStatusAction({
        academicYearLabel: row.primaryValue,
        id: row.id,
        resource: action.resource,
        targetStatus: action.targetStatus,
      });
      return;
    }

    if (action.resource === AcademicResource.STUDY_PLAN) {
      onStatusAction({
        effectiveFrom: row.effectiveFrom ?? null,
        id: row.id,
        resource: action.resource,
        studyPlanLabel: row.primaryValue,
        targetStatus: action.targetStatus,
      });
      return;
    }

    onStatusAction({
      id: row.id,
      resource: action.resource,
      resourceLabel: row.primaryValue,
      targetStatus: action.targetStatus,
    });
  }

  function handleLifecycleAction(kind: "delete" | "restore"): void {
    onLifecycleAction(row.id, row.primaryValue, kind);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow>
          {global ? (
            <TableCell>
              <Link href={`/admin/institutions/${institutionId}`} className="font-medium hover:underline">
                {row.institutionName}
              </Link>
            </TableCell>
          ) : null}
          <TableCell className="font-medium">
            {resource === AcademicResource.ACADEMIC_YEAR || row.deletedAt ? (
              row.primaryValue
            ) : (
              <Link href={detailHref} className="hover:underline">
                {row.primaryValue}
              </Link>
            )}
          </TableCell>
          {row.detailValues.map((detail, index) => (
            <TableCell key={`${row.id}-${columns.detailLabels[index]}`} className="text-muted-foreground max-w-96 truncate">
              {detail}
            </TableCell>
          ))}
          <TableCell>
            <Badge variant={row.deletedAt ? "destructive" : row.active ? "success" : "secondary"}>{row.deletedAt ? "Eliminado" : row.status}</Badge>
          </TableCell>
          <TableCell className="pr-4">
            <AcademicRowActions
              actions={actions}
              label={row.primaryValue}
              onLifecycleAction={handleLifecycleAction}
              onStatusAction={handleStatusAction}
            />
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      {actions.length > 0 ? (
        <ContextMenuContent className="w-44 p-1.5">
          <AcademicContextMenuActions actions={actions} onLifecycleAction={handleLifecycleAction} onStatusAction={handleStatusAction} />
        </ContextMenuContent>
      ) : null}
    </ContextMenu>
  );
}
