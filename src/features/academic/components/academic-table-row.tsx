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
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicStatusSelection } from "@features/academic/types/academic-status-selection.types";
import type { AcademicYearStatus } from "@features/academic/types/academic-year-status.types";
import { getAcademicLifecycleCapabilities } from "@features/academic/utils/academic-lifecycle.util";

type AcademicNavigationAction = {
  href: string;
  kind: "navigate";
  label: string;
  preserveReturnTo?: boolean;
};

type AcademicStatusAction =
  | {
      kind: "status";
      label: string;
      resource: AcademicResource.ACADEMIC_YEAR;
      targetStatus: Exclude<AcademicYearStatus, "PLANNED">;
    }
  | {
      kind: "status";
      label: string;
      resource: AcademicResource.STUDY_PLAN;
      targetStatus: "ACTIVE" | "INACTIVE";
    }
  | {
      kind: "status";
      label: string;
      resource: ActiveAcademicStatusResource;
      targetStatus: "ACTIVE" | "INACTIVE";
    };

type AcademicDeleteAction = {
  kind: "delete";
  label: "Eliminar";
};

type AcademicRestoreAction = { kind: "restore"; label: "Restaurar" };

type AcademicRowAction = AcademicNavigationAction | AcademicStatusAction | AcademicDeleteAction | AcademicRestoreAction;

type AcademicTableRowProps = {
  basePath: string;
  canChangeStatus: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canUpdate: boolean;
  columns: AcademicTableColumns;
  onLifecycleAction: (id: string, itemLabel: string, kind: "delete" | "restore") => void;
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
  onLifecycleAction,
  onStatusAction,
  resource,
  row,
}: AcademicTableRowProps): React.ReactElement {
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
            <TableCell
              key={`${row.id}-${columns.detailLabels[index]}`}
              className="text-muted-foreground max-w-96 truncate"
            >
              {detail}
            </TableCell>
          ))}
          <TableCell>
            <Badge variant={row.deletedAt ? "destructive" : row.active ? "success" : "secondary"}>
              {row.deletedAt ? "Eliminado" : row.status}
            </Badge>
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
          <AcademicContextMenuActions
            actions={actions}
            onLifecycleAction={handleLifecycleAction}
            onStatusAction={handleStatusAction}
          />
        </ContextMenuContent>
      ) : null}
    </ContextMenu>
  );
}

function AcademicContextMenuActions({
  actions,
  onLifecycleAction,
  onStatusAction,
}: {
  actions: readonly AcademicRowAction[];
  onLifecycleAction: (kind: "delete" | "restore") => void;
  onStatusAction: (action: AcademicStatusAction) => void;
}): React.ReactNode {
  return actions.map((action) => {
    if (action.kind === "navigate") {
      return (
        <ContextMenuItem key={action.href} asChild>
          <AcademicActionLink action={action} className="px-2.5 py-1.5" />
        </ContextMenuItem>
      );
    }

    if (action.kind === "status") {
      return (
        <ContextMenuItem
          key={action.label}
          variant={isDestructiveStatusAction(action) ? "destructive" : "default"}
          className="px-2.5 py-1.5"
          onSelect={() => onStatusAction(action)}
        >
          {action.label}
        </ContextMenuItem>
      );
    }

    return (
      <ContextMenuItem
        key={action.label}
        className={action.kind === "delete" ? "text-destructive focus:text-destructive px-2.5 py-1.5" : "px-2.5 py-1.5"}
        onSelect={() => onLifecycleAction(action.kind)}
      >
        {action.label}
      </ContextMenuItem>
    );
  });
}

function AcademicRowActions({
  actions,
  label,
  onLifecycleAction,
  onStatusAction,
}: {
  actions: readonly AcademicRowAction[];
  label: string;
  onLifecycleAction: (kind: "delete" | "restore") => void;
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
          <AcademicDropdownActions
            actions={actions}
            onLifecycleAction={onLifecycleAction}
            onStatusAction={onStatusAction}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AcademicDropdownActions({
  actions,
  onLifecycleAction,
  onStatusAction,
}: {
  actions: readonly AcademicRowAction[];
  onLifecycleAction: (kind: "delete" | "restore") => void;
  onStatusAction: (action: AcademicStatusAction) => void;
}): React.ReactNode {
  return actions.map((action) => {
    if (action.kind === "navigate") {
      return (
        <DropdownMenuItem key={action.href} asChild>
          <AcademicActionLink action={action} className="px-2.5 py-1.5" />
        </DropdownMenuItem>
      );
    }

    if (action.kind === "status") {
      return (
        <DropdownMenuItem
          key={action.label}
          variant={isDestructiveStatusAction(action) ? "destructive" : "default"}
          className="px-2.5 py-1.5"
          onSelect={() => onStatusAction(action)}
        >
          {action.label}
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuItem
        key={action.label}
        className={action.kind === "delete" ? "text-destructive focus:text-destructive px-2.5 py-1.5" : "px-2.5 py-1.5"}
        onSelect={() => onLifecycleAction(action.kind)}
      >
        {action.label}
      </DropdownMenuItem>
    );
  });
}

function getAcademicRowActions(
  basePath: string,
  resource: AcademicCollectionResource,
  row: AcademicTableRowData,
  canUpdate: boolean,
  canChangeStatus: boolean,
  canDelete: boolean,
  canRestore: boolean,
): readonly AcademicRowAction[] {
  const detailHref = `${basePath}/${resource}/${row.id}`;
  const lifecycle = getAcademicLifecycleCapabilities(resource, row, {
    delete: canDelete,
    restore: canRestore,
  });
  if (lifecycle.isDeleted) return lifecycle.canRestore ? [{ kind: "restore", label: "Restaurar" }] : [];
  if (resource === AcademicResource.ACADEMIC_YEAR) {
    if ((!canUpdate && !canChangeStatus && !lifecycle.canDelete) || !row.statusValue) return [];

    const actions: AcademicRowAction[] = [];
    if (row.statusValue === "PLANNED") {
      if (canUpdate)
        actions.push({ href: `${detailHref}/edit`, kind: "navigate", label: "Editar", preserveReturnTo: true });
      if (canChangeStatus) {
        actions.push({
          kind: "status",
          label: "Activar",
          resource: AcademicResource.ACADEMIC_YEAR,
          targetStatus: "ACTIVE",
        });
      }
    } else if (row.statusValue === "ACTIVE" && canChangeStatus) {
      actions.push({
        kind: "status",
        label: "Finalizar",
        resource: AcademicResource.ACADEMIC_YEAR,
        targetStatus: "CLOSED",
      });
    }

    if (lifecycle.canDelete) actions.push({ kind: "delete", label: "Eliminar" });
    return actions;
  }

  if (resource === AcademicResource.STUDY_PLAN) {
    const actions: AcademicRowAction[] = [{ href: detailHref, kind: "navigate", label: "Ver detalle" }];
    if (canUpdate && row.statusValue === "DRAFT") {
      actions.push({ href: `${detailHref}/edit`, kind: "navigate", label: "Editar", preserveReturnTo: true });
    }
    if (canChangeStatus && row.statusValue === "DRAFT") {
      actions.push({ kind: "status", label: "Activar", resource: AcademicResource.STUDY_PLAN, targetStatus: "ACTIVE" });
    }
    if (canChangeStatus && row.statusValue === "ACTIVE") {
      actions.push({
        kind: "status",
        label: "Desactivar",
        resource: AcademicResource.STUDY_PLAN,
        targetStatus: "INACTIVE",
      });
    }
    if (lifecycle.canDelete) actions.push({ kind: "delete", label: "Eliminar" });
    return actions;
  }

  if (isActiveStatusResource(resource)) {
    const actions: AcademicRowAction[] = [{ href: detailHref, kind: "navigate", label: "Ver detalle" }];
    if (canUpdate)
      actions.push({ href: `${detailHref}/edit`, kind: "navigate", label: "Editar", preserveReturnTo: true });
    if (canChangeStatus) {
      actions.push({
        kind: "status",
        label: row.active ? "Desactivar" : "Activar",
        resource,
        targetStatus: row.active ? "INACTIVE" : "ACTIVE",
      });
    }
    if (lifecycle.canDelete) actions.push({ kind: "delete", label: "Eliminar" });
    return actions;
  }

  return [{ href: detailHref, kind: "navigate", label: "Ver detalle" }];
}

function isActiveStatusResource(resource: AcademicCollectionResource): resource is ActiveAcademicStatusResource {
  return (
    resource === AcademicResource.TRAINING_PATH ||
    resource === AcademicResource.ACADEMIC_SPACE ||
    resource === AcademicResource.INSTRUMENT ||
    resource === AcademicResource.SHIFT
  );
}

function isDestructiveStatusAction(action: AcademicStatusAction): boolean {
  return action.targetStatus === "INACTIVE" || action.targetStatus === "CLOSED";
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
