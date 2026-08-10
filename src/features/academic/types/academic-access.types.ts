export type AcademicAccess = {
  yearRead: boolean;
  yearCreate: boolean;
  yearUpdate: boolean;
  yearStatusUpdate: boolean;
  trainingPathRead: boolean;
  trainingPathCreate: boolean;
  trainingPathUpdate: boolean;
  trainingPathStatusUpdate: boolean;
  studyPlanRead: boolean;
  studyPlanCreate: boolean;
  studyPlanUpdate: boolean;
  studyPlanStatusUpdate: boolean;
  studyPlanCurriculumUpdate: boolean;
  academicSpaceRead: boolean;
  academicSpaceCreate: boolean;
  academicSpaceUpdate: boolean;
  academicSpaceStatusUpdate: boolean;
  instrumentRead: boolean;
  instrumentCreate: boolean;
  instrumentUpdate: boolean;
  instrumentStatusUpdate: boolean;
};

export function canReadAcademic(access: AcademicAccess): boolean {
  return (
    access.yearRead ||
    access.trainingPathRead ||
    access.studyPlanRead ||
    access.academicSpaceRead ||
    access.instrumentRead
  );
}

export const FULL_ACADEMIC_ACCESS: AcademicAccess = {
  yearRead: true,
  yearCreate: true,
  yearUpdate: true,
  yearStatusUpdate: true,
  trainingPathRead: true,
  trainingPathCreate: true,
  trainingPathUpdate: true,
  trainingPathStatusUpdate: true,
  studyPlanRead: true,
  studyPlanCreate: true,
  studyPlanUpdate: true,
  studyPlanStatusUpdate: true,
  studyPlanCurriculumUpdate: true,
  academicSpaceRead: true,
  academicSpaceCreate: true,
  academicSpaceUpdate: true,
  academicSpaceStatusUpdate: true,
  instrumentRead: true,
  instrumentCreate: true,
  instrumentUpdate: true,
  instrumentStatusUpdate: true,
};
