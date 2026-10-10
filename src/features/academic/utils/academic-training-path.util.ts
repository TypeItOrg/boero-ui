import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

export function getAcademicTrainingPathId(resource: AcademicResource, item: AcademicCollection): string | undefined {
  if (resource === AcademicResource.TRAINING_PATH) {
    return item.id;
  }

  if ("trainingPathId" in item) {
    return String(item.trainingPathId);
  }

  return undefined;
}
