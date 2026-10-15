export interface StartEnrollmentApplicationInput {
  trainingPathId: string;
  enrollmentPeriodId?: string;
  academicYearId?: string;
  /** Person the application is for. Omit to apply for yourself; a guardian sets it to one of their dependents. */
  applicantPersonId?: string;
}
