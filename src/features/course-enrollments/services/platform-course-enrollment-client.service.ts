import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";
import type { CourseWaitlistEntry } from "@features/course-enrollments/types/course-waitlist-entry.types";

export async function fetchPlatformCourseEnrollmentOptions(institutionId: string, courseId: string): Promise<CourseEnrollmentAssignmentOptions> {
  const searchParams = new URLSearchParams({ institutionId });
  const response = await fetch(`/api/admin/courses/${courseId}/enrollment-options?${searchParams}`, { cache: "no-store" });

  return parseHttpResponse(response, "No se pudieron obtener los horarios disponibles.");
}

export async function fetchPlatformCourseWaitlist(institutionId: string, courseId: string): Promise<CourseWaitlistEntry[]> {
  const searchParams = new URLSearchParams({ institutionId });
  const response = await fetch(`/api/admin/courses/${courseId}/waitlist?${searchParams}`, { cache: "no-store" });

  return parseHttpResponse(response, "No se pudo obtener la lista de espera.");
}
