export type PlatformEnrollmentApplicationSummary = {
  institutionId: string;
  applicationId: string;
  applicantName: string;
  studyPlanName: string;
  canApproveProvisionally?: boolean;
  canConfirm?: boolean;
};
