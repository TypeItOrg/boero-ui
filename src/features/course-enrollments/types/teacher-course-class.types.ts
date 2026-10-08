import type { CourseClass } from "@features/academic/types/course-class.types";

export interface TeacherCourseClass {
  courseId: string;
  academicSpaceName: string;
  instrumentName: string | null;
  classLabel: string;
  courseClass: CourseClass;
}
