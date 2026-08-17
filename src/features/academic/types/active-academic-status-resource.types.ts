import { AcademicResource } from "@features/academic/types/academic-resource.types";

export type ActiveAcademicStatusResource =
  | AcademicResource.TRAINING_PATH
  | AcademicResource.ACADEMIC_SPACE
  | AcademicResource.INSTRUMENT;
