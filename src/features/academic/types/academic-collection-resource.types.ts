import { AcademicResource } from "@features/academic/types/academic-resource.types";

export const ACADEMIC_COLLECTION_RESOURCES = [
  AcademicResource.ACADEMIC_YEAR,
  AcademicResource.TRAINING_PATH,
  AcademicResource.STUDY_PLAN,
  AcademicResource.ACADEMIC_SPACE,
  AcademicResource.INSTRUMENT,
] as const;

export type AcademicCollectionResource = (typeof ACADEMIC_COLLECTION_RESOURCES)[number];
