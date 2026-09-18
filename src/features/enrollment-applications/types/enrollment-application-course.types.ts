import type { EnrollmentApplicationCourseStatus } from "@features/enrollment-applications/types/enrollment-application-course-status.types";

export interface EnrollmentApplicationCourse {
  applicationCourseId: string;
  courseId: string;
  studyPlanSpaceId: string;
  academicSpaceName: string;
  academicLevelName: string | null;
  studyPlanName: string;
  trainingPathName: string;
  instrumentId: string | null;
  instrumentName: string | null;
  preferredTeacherId: string | null;
  status: EnrollmentApplicationCourseStatus;
  requestedAt: string | null;
  submittedWithCapacity: boolean | null;
  waitlistNumber: number | null;
  waitlistedAt: string | null;
  waitlistReason: string | null;
  resolvedAt: string | null;
  resolvedByPersonId: string | null;
  resolutionReasonCode: string | null;
  resolutionReasonText: string | null;
  version: number;
}
