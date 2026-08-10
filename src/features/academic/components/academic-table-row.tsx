import * as React from "react";
import Link from "next/link";
import { EllipsisVerticalIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@common/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@common/components/ui/table";
import type {
  AcademicTableColumns,
  AcademicTableRow as AcademicTableRowData,
} from "@features/academic/config/academic-collection.config";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicStatusSelection } from "@features/academic/types/academic-status-selection.types";
import type { AcademicYearStatus } from "@features/academic/types/academic-year-status.types";

type AcademicNavigationAction = {
  href: string;
  label: string;
  preserveReturnTo?: boolean;
};

type AcademicStatusAction =
  | {
      label: string;
      resource: AcademicResource.ACADEMIC_YEAR;
      targetStatus: Exclude<AcademicYearStatus, "PLANNED">;
    }
  | {
      label: string;
      resource: AcademicResource.STUDY_PLAN;
      targetStatus: "ACTIVE" | "INACTIVE";
    }
  | {
      label: string;
      resource: AcademicResource.TRAINING_PATH;
      targetStatus: "ACTIVE" | "INACTIVE";
    };

type AcademicRowAction = AcademicNavigationAction | AcademicStatusAction;

type AcademicTableRowProps = {
  basePath: string;
  canChangeStatus: boolean;
  canUpdate: boolean;
  columns: AcademicTableColumns;
  onStatusAction: (selection: AcademicStatusSelection) => void;
  resource: AcademicCollectionResource;
  row: AcademicTableRowData;
};

export function AcademicTableRow({
  basePath,
  canChangeStatus,
  canUpdate,
  columns,
  onStatusAction,
  resource,
  row,
}: AcademicTableRowProps): React.ReactElement {
  const detailHref = `${basePath}/${resource}/${row.id}`;
  const actions = getAcademicRowActions(basePath, resource, row, canUpdate, canChangeStatus);

  function handleStatusAction(action: AcademicStatusAction): void {
    if (action.resource === AcademicResource.ACADEMIC_YEAR) {
      onStatusAction({ ...action, academicYearLabel: row.primaryValue, id: row.id });
      return;
    }

    if (action.resource === AcademicResource.TRAINING_PATH) {
      onStatusAction({ ...action, id: row.id, trainingPathLabel: row.primaryValue });
      return;
    }

    onStatusAction({
      ...action,
      effectiveFrom: row.effectiveFrom ?? null,
      id: row.id,
      studyPlanLabel: row.primaryValue,
    });
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow>
          <TableCell className="font-medium">
            {resource === AcademicResource.ACADEMIC_YEAR ? (
              row.primaryValue
            ) : (
              <Link href={detailHref} className="hover:underline">
                {row.primaryValue}
              </Link>
            )}
          </TableCell>
          {row.detailValues.map((detail, index) => (
            <TableCell
              key={`${row.id}-${columns.detailLabels[index]}`}
              className="text-muted-foreground max-w-96 truncate"
            >
              {detail}
            </TableCell>
          ))}
          <TableCell>
            <Badge variant={row.active ? "success" : "secondary"}>{row.status}</Badge>
          </TableCell>
          <TableCell className="pr-4">
            <AcademicRowActions actions={actions} label={row.primaryValue} onStatusAction={handleStatusAction} />
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      {actions.length > 0 ? (
        <ContextMenuContent className="w-44 p-1.5">
          {actions.map((action) =>
            "targetStatus" in action ? (
              <ContextMenuItem key={action.label} className="px-2.5 py-1.5" onSelect={() => handleStatusAction(action)}>
                {action.label}
              </ContextMenuItem>
            ) : (
              <ContextMenuItem key={action.href} asChild>
                <AcademicActionLink action={action} className="px-2.5 py-1.5" />
              </ContextMenuItem>
            ),
          )}
        </ContextMenuContent>
      ) : null}
    </ContextMenu>
  );
}

function AcademicRowActions({
  actions,
  label,
  onStatusAction,
}: {
  actions: readonly AcademicRowAction[];
  label: string;
  onStatusAction: (action: AcademicStatusAction) => void;
}): React.ReactElement {
  if (actions.length === 0) return <div className="h-9" />;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${label}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1.5">
          {actions.map((action) =>
            "targetStatus" in action ? (
              <DropdownMenuItem key={action.label} className="px-2.5 py-1.5" onSelect={() => onStatusAction(action)}>
                {action.label}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem key={action.href} asChild>
                <AcademicActionLink action={action} className="px-2.5 py-1.5" />
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function getAcademicRowActions(
  basePath: string,
  resource: AcademicCollectionResource,
  row: AcademicTableRowData,
  canUpdate: boolean,
  canChangeStatus: boolean,
): readonly AcademicRowAction[] {
  const detailHref = `${basePath}/${resource}/${row.id}`;
  if (resource === AcademicResource.ACADEMIC_YEAR) {
    if ((!canUpdate && !canChangeStatus) || !row.statusValue) return [];

    const actions: AcademicRowAction[] = [];
    if (row.statusValue === "PLANNED") {
      if (canUpdate) actions.push({ href: `${detailHref}/edit`, label: "Editar", preserveReturnTo: true });
      if (canChangeStatus) {
        actions.push({ label: "Activar", resource: AcademicResource.ACADEMIC_YEAR, targetStatus: "ACTIVE" });
      }
    } else if (row.statusValue === "ACTIVE" && canChangeStatus) {
      actions.push({ label: "Finalizar", resource: AcademicResource.ACADEMIC_YEAR, targetStatus: "CLOSED" });
    }

    return actions;
  }

  if (resource === AcademicResource.STUDY_PLAN) {
    const actions: AcademicRowAction[] = [{ href: detailHref, label: "Ver detalle" }];
    if (canUpdate && row.statusValue === "DRAFT") {
      actions.push({ href: `${detailHref}/edit`, label: "Editar", preserveReturnTo: true });
    }
    if (canChangeStatus && row.statusValue === "DRAFT") {
      actions.push({ label: "Activar", resource: AcademicResource.STUDY_PLAN, targetStatus: "ACTIVE" });
    }
    if (canChangeStatus && row.statusValue === "ACTIVE") {
      actions.push({ label: "Desactivar", resource: AcademicResource.STUDY_PLAN, targetStatus: "INACTIVE" });
    }
    return actions;
  }

  if (resource === AcademicResource.TRAINING_PATH) {
    const actions: AcademicRowAction[] = [{ href: detailHref, label: "Ver detalle" }];
    if (canUpdate) {
      actions.push({ href: `${detailHref}/edit`, label: "Editar", preserveReturnTo: true });
    }
    if (canChangeStatus) {
      actions.push({
        label: row.active ? "Desactivar" : "Activar",
        resource: AcademicResource.TRAINING_PATH,
        targetStatus: row.active ? "INACTIVE" : "ACTIVE",
      });
    }
    return actions;
  }

  return [{ href: detailHref, label: "Ver detalle" }];
}

type AcademicActionLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  action: AcademicNavigationAction;
};

const AcademicActionLink = React.forwardRef<HTMLAnchorElement, AcademicActionLinkProps>(function AcademicActionLink(
  { action, ...props },
  ref,
): React.ReactElement {
  if (action.preserveReturnTo) {
    return (
      <ReturnToLink ref={ref} href={action.href} {...props}>
        {action.label}
      </ReturnToLink>
    );
  }

  return (
    <Link ref={ref} href={action.href} {...props}>
      {action.label}
    </Link>
  );
});
AcademicActionLink.displayName = "AcademicActionLink";
