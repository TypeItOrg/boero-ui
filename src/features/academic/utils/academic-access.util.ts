import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";
import { hasInstitutionalPermission, hasTrainingPathPermission } from "@features/institutional-auth/utils/institutional-permission.util";

export function getAcademicAccess(user: InstitutionalUser, trainingPathId?: string): AcademicAccess {
  const permits = (permission: Parameters<typeof hasInstitutionalPermission>[1]) =>
    trainingPathId === undefined ? hasInstitutionalPermission(user, permission) : hasTrainingPathPermission(user, permission, trainingPathId);
  return {
    yearRead: permits(INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_READ),
    yearCreate: permits(INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_CREATE),
    yearUpdate: permits(INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_UPDATE),
    yearStatusUpdate: permits(INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_STATUS_UPDATE),
    yearDelete: permits(INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_DELETE),
    yearRestore: permits(INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_RESTORE),
    trainingPathRead: permits(INSTITUTIONAL_PERMISSION.TRAINING_PATH_READ),
    trainingPathCreate: permits(INSTITUTIONAL_PERMISSION.TRAINING_PATH_CREATE),
    trainingPathUpdate: permits(INSTITUTIONAL_PERMISSION.TRAINING_PATH_UPDATE),
    trainingPathStatusUpdate: permits(INSTITUTIONAL_PERMISSION.TRAINING_PATH_STATUS_UPDATE),
    trainingPathDelete: permits(INSTITUTIONAL_PERMISSION.TRAINING_PATH_DELETE),
    trainingPathRestore: permits(INSTITUTIONAL_PERMISSION.TRAINING_PATH_RESTORE),
    studyPlanRead: permits(INSTITUTIONAL_PERMISSION.STUDY_PLAN_READ),
    studyPlanCreate: permits(INSTITUTIONAL_PERMISSION.STUDY_PLAN_CREATE),
    studyPlanUpdate: permits(INSTITUTIONAL_PERMISSION.STUDY_PLAN_UPDATE),
    studyPlanStatusUpdate: permits(INSTITUTIONAL_PERMISSION.STUDY_PLAN_STATUS_UPDATE),
    studyPlanCurriculumUpdate: permits(INSTITUTIONAL_PERMISSION.STUDY_PLAN_CURRICULUM_UPDATE),
    studyPlanDelete: permits(INSTITUTIONAL_PERMISSION.STUDY_PLAN_DELETE),
    studyPlanRestore: permits(INSTITUTIONAL_PERMISSION.STUDY_PLAN_RESTORE),
    academicSpaceRead: permits(INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_READ),
    academicSpaceCreate: permits(INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_CREATE),
    academicSpaceUpdate: permits(INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_UPDATE),
    academicSpaceStatusUpdate: permits(INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_STATUS_UPDATE),
    academicSpaceDelete: permits(INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_DELETE),
    academicSpaceRestore: permits(INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_RESTORE),
    instrumentRead: permits(INSTITUTIONAL_PERMISSION.INSTRUMENT_READ),
    instrumentCreate: permits(INSTITUTIONAL_PERMISSION.INSTRUMENT_CREATE),
    instrumentUpdate: permits(INSTITUTIONAL_PERMISSION.INSTRUMENT_UPDATE),
    instrumentStatusUpdate: permits(INSTITUTIONAL_PERMISSION.INSTRUMENT_STATUS_UPDATE),
    instrumentDelete: permits(INSTITUTIONAL_PERMISSION.INSTRUMENT_DELETE),
    instrumentRestore: permits(INSTITUTIONAL_PERMISSION.INSTRUMENT_RESTORE),
    courseWaitlistRead: permits(INSTITUTIONAL_PERMISSION.COURSE_WAITLIST_READ),
    courseRead: permits(INSTITUTIONAL_PERMISSION.COURSE_READ),
    courseCreate: permits(INSTITUTIONAL_PERMISSION.COURSE_CREATE),
    courseUpdate: permits(INSTITUTIONAL_PERMISSION.COURSE_UPDATE),
    courseStatusUpdate: permits(INSTITUTIONAL_PERMISSION.COURSE_STATUS_UPDATE),
    courseDelete: permits(INSTITUTIONAL_PERMISSION.COURSE_DELETE),
    courseRestore: permits(INSTITUTIONAL_PERMISSION.COURSE_RESTORE),
    shiftRead: permits(INSTITUTIONAL_PERMISSION.SHIFT_READ),
    shiftCreate: permits(INSTITUTIONAL_PERMISSION.SHIFT_CREATE),
    shiftUpdate: permits(INSTITUTIONAL_PERMISSION.SHIFT_UPDATE),
    shiftStatusUpdate: permits(INSTITUTIONAL_PERMISSION.SHIFT_STATUS_UPDATE),
    shiftDelete: permits(INSTITUTIONAL_PERMISSION.SHIFT_DELETE),
    shiftRestore: permits(INSTITUTIONAL_PERMISSION.SHIFT_RESTORE),
  };
}
