export function enrollmentCourseGroupKey(course: { studyPlanSpaceId: string; academicYear?: number; courseId: string }): string {
  return course.academicYear === undefined ? course.courseId : `${course.studyPlanSpaceId}:${course.academicYear}`;
}
