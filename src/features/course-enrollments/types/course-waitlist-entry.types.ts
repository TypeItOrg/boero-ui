import type { EnrollmentApplicationCourse } from "@features/enrollment-applications/types/enrollment-application-course.types";

export interface CourseWaitlistEntry {
  applicationId: string;
  applicationCourse: EnrollmentApplicationCourse;
  hasCapacity: boolean;
  applicationCourseId: string;
  courseId: string;
  waitlistNumber: number;
  applicantName: string;
  applicantDocumentNumber: string;
  requestedAt: string | null;
  waitlistedAt: string;
  originalReason: string | null;
  currentSituation: string;
  preferredShift: string | null;
  preferredTeacherId: string | null;
}
