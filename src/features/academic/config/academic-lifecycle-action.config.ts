import { z } from "zod";

import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { LifecycleResource } from "@features/academic/types/lifecycle-resource.types";
import { INSTITUTIONAL_PERMISSION, type InstitutionalPermission } from "@features/institutional-auth/types/institutional-permission.types";

export const deletableResourceSchema = z.enum([
  AcademicResource.ACADEMIC_YEAR,
  AcademicResource.TRAINING_PATH,
  AcademicResource.STUDY_PLAN,
  AcademicResource.ACADEMIC_SPACE,
  AcademicResource.INSTRUMENT,
  AcademicResource.COURSE,
  AcademicResource.SHIFT,
  AcademicResource.ACADEMIC_LEVEL,
  AcademicResource.STUDY_PLAN_SPACE,
  AcademicResource.PREREQUISITE,
]);

export const restorableResourceSchema = z.enum([
  AcademicResource.ACADEMIC_YEAR,
  AcademicResource.TRAINING_PATH,
  AcademicResource.STUDY_PLAN,
  AcademicResource.ACADEMIC_SPACE,
  AcademicResource.INSTRUMENT,
  AcademicResource.COURSE,
  AcademicResource.SHIFT,
]);

export const DELETE_PERMISSIONS: Record<LifecycleResource, InstitutionalPermission> = {
  [AcademicResource.ACADEMIC_YEAR]: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_DELETE,
  [AcademicResource.TRAINING_PATH]: INSTITUTIONAL_PERMISSION.TRAINING_PATH_DELETE,
  [AcademicResource.STUDY_PLAN]: INSTITUTIONAL_PERMISSION.STUDY_PLAN_DELETE,
  [AcademicResource.ACADEMIC_SPACE]: INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_DELETE,
  [AcademicResource.INSTRUMENT]: INSTITUTIONAL_PERMISSION.INSTRUMENT_DELETE,
  [AcademicResource.COURSE]: INSTITUTIONAL_PERMISSION.COURSE_DELETE,
  [AcademicResource.SHIFT]: INSTITUTIONAL_PERMISSION.SHIFT_DELETE,
};

export const RESTORE_PERMISSIONS: Record<LifecycleResource, InstitutionalPermission> = {
  [AcademicResource.ACADEMIC_YEAR]: INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_RESTORE,
  [AcademicResource.TRAINING_PATH]: INSTITUTIONAL_PERMISSION.TRAINING_PATH_RESTORE,
  [AcademicResource.STUDY_PLAN]: INSTITUTIONAL_PERMISSION.STUDY_PLAN_RESTORE,
  [AcademicResource.ACADEMIC_SPACE]: INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_RESTORE,
  [AcademicResource.INSTRUMENT]: INSTITUTIONAL_PERMISSION.INSTRUMENT_RESTORE,
  [AcademicResource.COURSE]: INSTITUTIONAL_PERMISSION.COURSE_RESTORE,
  [AcademicResource.SHIFT]: INSTITUTIONAL_PERMISSION.SHIFT_RESTORE,
};
