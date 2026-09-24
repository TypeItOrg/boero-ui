export interface StartEnrollmentApplicationInput {
  studyPlanId: string;
  academicYearId: string;
  /** Person the application is for. Omit to apply for yourself; a guardian sets it to one of their dependents. */
  applicantPersonId?: string;
}
