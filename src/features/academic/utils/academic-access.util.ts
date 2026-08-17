import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";

export function getAcademicAccess(user: InstitutionalUser): AcademicAccess {
  return {
    yearRead: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_READ),
    yearCreate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_CREATE),
    yearUpdate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_UPDATE),
    yearStatusUpdate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_STATUS_UPDATE),
    yearDelete: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_DELETE),
    yearRestore: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_RESTORE),
    trainingPathRead: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.TRAINING_PATH_READ),
    trainingPathCreate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.TRAINING_PATH_CREATE),
    trainingPathUpdate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.TRAINING_PATH_UPDATE),
    trainingPathStatusUpdate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.TRAINING_PATH_STATUS_UPDATE),
    trainingPathDelete: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.TRAINING_PATH_DELETE),
    trainingPathRestore: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.TRAINING_PATH_RESTORE),
    studyPlanRead: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.STUDY_PLAN_READ),
    studyPlanCreate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.STUDY_PLAN_CREATE),
    studyPlanUpdate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.STUDY_PLAN_UPDATE),
    studyPlanStatusUpdate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.STUDY_PLAN_STATUS_UPDATE),
    studyPlanCurriculumUpdate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.STUDY_PLAN_CURRICULUM_UPDATE),
    studyPlanDelete: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.STUDY_PLAN_DELETE),
    studyPlanRestore: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.STUDY_PLAN_RESTORE),
    academicSpaceRead: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_READ),
    academicSpaceCreate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_CREATE),
    academicSpaceUpdate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_UPDATE),
    academicSpaceStatusUpdate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_STATUS_UPDATE),
    academicSpaceDelete: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_DELETE),
    academicSpaceRestore: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_RESTORE),
    instrumentRead: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTRUMENT_READ),
    instrumentCreate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTRUMENT_CREATE),
    instrumentUpdate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTRUMENT_UPDATE),
    instrumentStatusUpdate: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTRUMENT_STATUS_UPDATE),
    instrumentDelete: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTRUMENT_DELETE),
    instrumentRestore: hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTRUMENT_RESTORE),
  };
}
