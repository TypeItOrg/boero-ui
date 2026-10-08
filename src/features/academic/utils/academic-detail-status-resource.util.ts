import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";

export function isDetailStatusResource(resource: AcademicCollectionResource): resource is ActiveAcademicStatusResource {
  return (
    resource === AcademicResource.ACADEMIC_SPACE ||
    resource === AcademicResource.INSTRUMENT ||
    resource === AcademicResource.TRAINING_PATH ||
    resource === AcademicResource.SHIFT
  );
}
