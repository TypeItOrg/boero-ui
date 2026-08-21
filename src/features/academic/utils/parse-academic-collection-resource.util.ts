import { ACADEMIC_COLLECTION_RESOURCES, type AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";

const academicCollectionResourceSet = new Set<string>(ACADEMIC_COLLECTION_RESOURCES);

export function parseAcademicCollectionResource(value: string | undefined): AcademicCollectionResource | undefined {
  if (!value || !academicCollectionResourceSet.has(value)) return undefined;
  return value as AcademicCollectionResource;
}
