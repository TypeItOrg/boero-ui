import { AcademicResource } from "@features/academic/types/academic-resource.types";

export type LifecycleResource =
  | AcademicResource.ACADEMIC_YEAR
  | AcademicResource.TRAINING_PATH
  | AcademicResource.STUDY_PLAN
  | AcademicResource.ACADEMIC_SPACE
  | AcademicResource.INSTRUMENT
  | AcademicResource.COURSE;
