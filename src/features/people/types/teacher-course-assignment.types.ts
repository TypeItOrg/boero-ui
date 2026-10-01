import type { CourseClass } from "@features/academic/types/course-class.types";

export type TeacherCourseAssignment = {
  courseId: string;
  academicSpaceName: string;
  instrumentName: string | null;
  academicYear: number;
  classes: CourseClass[];
};
