import type { TeacherCourseClass } from "@features/course-enrollments/types/teacher-course-class.types";

export interface TeacherWeeklySchedules {
  weekStart: string;
  weekEnd: string;
  classes: TeacherCourseClass[];
}
