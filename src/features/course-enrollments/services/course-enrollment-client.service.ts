import { COMMON_ERROR_MESSAGES } from "@common/constants/error-messages.constants";
import { parseHttpResponse } from "@common/utils/http-response-error.util";

import { COURSE_ENROLLMENT_MESSAGES, COURSE_ENROLLMENT_OPTIONS_TIMEOUT_MS } from "@features/course-enrollments/constants/course-enrollment.constants";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";

export function fetchCourseEnrollmentOptions(courseId: string, signal?: AbortSignal): Promise<CourseEnrollmentAssignmentOptions> {
  return fetchEnrollmentAssignmentOptions(`/api/courses/${courseId}/enrollment-options`, courseId, signal);
}

export async function fetchEnrollmentAssignmentOptions(
  url: string,
  courseId: string,
  signal?: AbortSignal,
): Promise<CourseEnrollmentAssignmentOptions> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(COURSE_ENROLLMENT_OPTIONS_TIMEOUT_MS)])
        : AbortSignal.timeout(COURSE_ENROLLMENT_OPTIONS_TIMEOUT_MS),
    });

    if (response.redirected || response.status === 401) {
      throw new Error(COMMON_ERROR_MESSAGES.SESSION_REQUIRED);
    }

    const options = await parseHttpResponse<CourseEnrollmentAssignmentOptions | null>(response, COURSE_ENROLLMENT_MESSAGES.ASSIGNMENTS_FAILED);

    if (
      !options ||
      options.courseId !== courseId ||
      (options.format !== "INDIVIDUAL" && options.format !== "GRUPAL") ||
      !Array.isArray(options.classes)
    ) {
      throw new Error(COURSE_ENROLLMENT_MESSAGES.ASSIGNMENTS_FAILED);
    }

    return options;
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(COURSE_ENROLLMENT_MESSAGES.ASSIGNMENTS_TIMEOUT);
    }

    throw error;
  }
}
