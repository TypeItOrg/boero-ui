import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { ACADEMIC_ROW_ACTION_KIND } from "@features/academic/types/academic-row-action-kind.types";
import type { AcademicRowAction } from "@features/academic/types/academic-row-action.types";
import type { AcademicTableRow } from "@features/academic/types/academic-table-row.types";
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";
import { getAcademicLifecycleCapabilities } from "@features/academic/utils/academic-lifecycle.util";

export function getAcademicRowActions(
  basePath: string,
  resource: AcademicCollectionResource,
  row: AcademicTableRow,
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
  if (lifecycle.isDeleted) {
    return lifecycle.canRestore ? [{ kind: ACADEMIC_ROW_ACTION_KIND.RESTORE, label: "Restaurar" }] : [];
  }
  if (resource === AcademicResource.ACADEMIC_YEAR) {
    if ((!canUpdate && !canChangeStatus && !lifecycle.canDelete) || !row.statusValue) return [];

    const actions: AcademicRowAction[] = [];
    if (row.statusValue === "PLANNED") {
      if (canUpdate)
        actions.push({
          href: `${detailHref}/edit`,
          kind: ACADEMIC_ROW_ACTION_KIND.NAVIGATE,
          label: "Editar",
          preserveReturnTo: true,
        });
      if (canChangeStatus) {
        actions.push({
          kind: ACADEMIC_ROW_ACTION_KIND.STATUS,
          label: "Activar",
          resource: AcademicResource.ACADEMIC_YEAR,
          targetStatus: "ACTIVE",
        });
      }
    } else if (row.statusValue === "ACTIVE" && canChangeStatus) {
      actions.push({
        kind: ACADEMIC_ROW_ACTION_KIND.STATUS,
        label: "Finalizar",
        resource: AcademicResource.ACADEMIC_YEAR,
        targetStatus: "CLOSED",
      });
    }

    if (lifecycle.canDelete) actions.push({ kind: ACADEMIC_ROW_ACTION_KIND.DELETE, label: "Eliminar" });
    return actions;
  }

  if (resource === AcademicResource.STUDY_PLAN) {
    const actions: AcademicRowAction[] = [{ href: detailHref, kind: ACADEMIC_ROW_ACTION_KIND.NAVIGATE, label: "Ver detalle" }];
    if (canUpdate && row.statusValue === "DRAFT") {
      actions.push({
        href: `${detailHref}/edit`,
        kind: ACADEMIC_ROW_ACTION_KIND.NAVIGATE,
        label: "Editar",
        preserveReturnTo: true,
      });
    }
    if (canChangeStatus && row.statusValue === "DRAFT") {
      actions.push({
        kind: ACADEMIC_ROW_ACTION_KIND.STATUS,
        label: "Activar",
        resource: AcademicResource.STUDY_PLAN,
        targetStatus: "ACTIVE",
      });
    }
    if (canChangeStatus && row.statusValue === "ACTIVE") {
      actions.push({
        kind: ACADEMIC_ROW_ACTION_KIND.STATUS,
        label: "Desactivar",
        resource: AcademicResource.STUDY_PLAN,
        targetStatus: "INACTIVE",
      });
    }
    if (lifecycle.canDelete) actions.push({ kind: ACADEMIC_ROW_ACTION_KIND.DELETE, label: "Eliminar" });
    return actions;
  }

  if (isActiveStatusResource(resource)) {
    const actions: AcademicRowAction[] = [{ href: detailHref, kind: ACADEMIC_ROW_ACTION_KIND.NAVIGATE, label: "Ver detalle" }];
    if (canUpdate)
      actions.push({
        href: `${detailHref}/edit`,
        kind: ACADEMIC_ROW_ACTION_KIND.NAVIGATE,
        label: "Editar",
        preserveReturnTo: true,
      });
    if (canChangeStatus) {
      actions.push({
        kind: ACADEMIC_ROW_ACTION_KIND.STATUS,
        label: row.active ? "Desactivar" : "Activar",
        resource,
        targetStatus: row.active ? "INACTIVE" : "ACTIVE",
      });
    }
    if (lifecycle.canDelete) actions.push({ kind: ACADEMIC_ROW_ACTION_KIND.DELETE, label: "Eliminar" });
    return actions;
  }

  return [{ href: detailHref, kind: ACADEMIC_ROW_ACTION_KIND.NAVIGATE, label: "Ver detalle" }];
}

export function isActiveStatusResource(resource: AcademicCollectionResource): resource is ActiveAcademicStatusResource {
  return resource === AcademicResource.TRAINING_PATH || resource === AcademicResource.ACADEMIC_SPACE || resource === AcademicResource.INSTRUMENT;
}

export function isDestructiveStatusAction(action: Extract<AcademicRowAction, { kind: typeof ACADEMIC_ROW_ACTION_KIND.STATUS }>): boolean {
  return action.targetStatus === "INACTIVE" || action.targetStatus === "CLOSED";
}
