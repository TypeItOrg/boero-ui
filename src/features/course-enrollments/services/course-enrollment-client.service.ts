import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";

export async function fetchCourseEnrollmentOptions(courseId: string): Promise<CourseEnrollmentAssignmentOptions> {
  const response = await fetch(`/api/courses/${courseId}/enrollment-options`, { cache: "no-store" });

  return parseHttpResponse(response, "No se pudieron obtener los horarios disponibles.");
}
