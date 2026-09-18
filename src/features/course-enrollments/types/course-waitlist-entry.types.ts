export interface CourseWaitlistEntry {
  applicationCourseId: string;
  courseId: string;
  waitlistNumber: number;
  applicantName: string;
  applicantDocumentNumber: string;
  requestedAt: string;
  waitlistedAt: string;
  originalReason: string | null;
  currentSituation: string;
  preferredShift: string | null;
  preferredTeacherId: string | null;
}
