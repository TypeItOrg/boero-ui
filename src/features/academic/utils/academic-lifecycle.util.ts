import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

type LifecycleInput = {
  active: boolean;
  deletedAt?: string | null;
  statusValue?: string;
};

export type AcademicLifecycleCapabilities = {
  canDelete: boolean;
  canRestore: boolean;
  isDeleted: boolean;
};

export function getAcademicLifecycleCapabilities(
  resource: AcademicCollectionResource,
  item: LifecycleInput,
  permissions: { delete: boolean; restore: boolean },
): AcademicLifecycleCapabilities {
  const isDeleted = item.deletedAt != null;
  return {
    canDelete: !isDeleted && permissions.delete && isDeletableState(resource, item),
    canRestore: isDeleted && permissions.restore,
    isDeleted,
  };
}

function isDeletableState(resource: AcademicCollectionResource, item: LifecycleInput): boolean {
  if (resource === AcademicResource.ACADEMIC_YEAR) return item.statusValue === "PLANNED";
  if (resource === AcademicResource.STUDY_PLAN) return item.statusValue === "DRAFT";
  return !item.active;
}
