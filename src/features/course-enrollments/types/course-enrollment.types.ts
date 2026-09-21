import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentSource } from "@features/course-enrollments/types/course-enrollment-source.types";
import type { CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";

export interface CourseEnrollment {
  id: string;
  institutionId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  studyPlanSpaceId: string;
  academicSpaceName: string;
  academicLevelName?: string | null;
  studyPlanName: string;
  trainingPathName: string;
  trainingPathId: string;
  instrumentId?: string | null;
  instrumentName?: string | null;
  courseClassId: string;
  courseClassLabel: string;
  teachers?: { personId: string; fullName: string }[];
  source: CourseEnrollmentSource;
  status: CourseEnrollmentStatus;
  academicStatus: AcademicEnrollmentStatus;
  enrolledAt: string;
  completedAt?: string | null;
  withdrawnAt?: string | null;
  version: number;
  schedules: CourseEnrollmentSchedule[];
}

export interface CourseEnrollmentSchedule {
  id: string;
  classScheduleId: string;
  individualSlotId?: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  releasedAt?: string | null;
}
