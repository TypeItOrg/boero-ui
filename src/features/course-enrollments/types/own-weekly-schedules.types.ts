import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";

export type OwnWeeklySchedules = {
  weekStart: string;
  weekEnd: string;
  enrollments: CourseEnrollment[];
};
