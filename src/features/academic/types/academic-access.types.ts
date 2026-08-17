export type AcademicAccess = {
  yearRead: boolean;
  yearCreate: boolean;
  yearUpdate: boolean;
  yearStatusUpdate: boolean;
  yearDelete: boolean;
  yearRestore: boolean;
  trainingPathRead: boolean;
  trainingPathCreate: boolean;
  trainingPathUpdate: boolean;
  trainingPathStatusUpdate: boolean;
  trainingPathDelete: boolean;
  trainingPathRestore: boolean;
  studyPlanRead: boolean;
  studyPlanCreate: boolean;
  studyPlanUpdate: boolean;
  studyPlanStatusUpdate: boolean;
  studyPlanCurriculumUpdate: boolean;
  studyPlanDelete: boolean;
  studyPlanRestore: boolean;
  academicSpaceRead: boolean;
  academicSpaceCreate: boolean;
  academicSpaceUpdate: boolean;
  academicSpaceStatusUpdate: boolean;
  academicSpaceDelete: boolean;
  academicSpaceRestore: boolean;
  instrumentRead: boolean;
  instrumentCreate: boolean;
  instrumentUpdate: boolean;
  instrumentStatusUpdate: boolean;
  instrumentDelete: boolean;
  instrumentRestore: boolean;
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
  yearDelete: true,
  yearRestore: true,
  trainingPathRead: true,
  trainingPathCreate: true,
  trainingPathUpdate: true,
  trainingPathStatusUpdate: true,
  trainingPathDelete: true,
  trainingPathRestore: true,
  studyPlanRead: true,
  studyPlanCreate: true,
  studyPlanUpdate: true,
  studyPlanStatusUpdate: true,
  studyPlanCurriculumUpdate: true,
  studyPlanDelete: true,
  studyPlanRestore: true,
  academicSpaceRead: true,
  academicSpaceCreate: true,
  academicSpaceUpdate: true,
  academicSpaceStatusUpdate: true,
  academicSpaceDelete: true,
  academicSpaceRestore: true,
  instrumentRead: true,
  instrumentCreate: true,
  instrumentUpdate: true,
  instrumentStatusUpdate: true,
  instrumentDelete: true,
  instrumentRestore: true,
};
