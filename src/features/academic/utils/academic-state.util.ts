import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

export function canEditAcademicResource(resource: AcademicCollectionResource, item: AcademicCollection): boolean {
  switch (resource) {
    case AcademicResource.ACADEMIC_YEAR:
      return (item as Extract<AcademicCollection, { year: number }>).status === "PLANNED";
    case AcademicResource.STUDY_PLAN:
      return (item as Extract<AcademicCollection, { trainingPathId: string }>).status === "DRAFT";
    default:
      return true;
  }
}

export function canChangeAcademicStatus(resource: AcademicCollectionResource, item: AcademicCollection): boolean {
  switch (resource) {
    case AcademicResource.ACADEMIC_YEAR:
      return (item as Extract<AcademicCollection, { year: number }>).status !== "CLOSED";
    case AcademicResource.STUDY_PLAN:
      return (item as Extract<AcademicCollection, { trainingPathId: string }>).status !== "INACTIVE";
    default:
      return true;
  }
}
