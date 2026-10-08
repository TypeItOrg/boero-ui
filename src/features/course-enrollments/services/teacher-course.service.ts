import "server-only";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { TeacherCourseClass } from "@features/course-enrollments/types/teacher-course-class.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import type { TeacherWeeklySchedules } from "@features/course-enrollments/types/teacher-weekly-schedules.types";

export async function fetchTeacherClasses(institutionId: string, page: number, size: number): Promise<PaginatedResponse<TeacherCourseClass>> {
  return parseHttpResponse(
    await institutionalApiFetch(`/api/v1/institutions/${institutionId}/teacher/classes?page=${page}&size=${size}`),
    "No se pudieron cargar tus clases.",
  );
}

export async function fetchTeacherWeeklySchedules(institutionId: string, week: string): Promise<TeacherWeeklySchedules> {
  const params = new URLSearchParams({ week });

  return parseHttpResponse(
    await institutionalApiFetch(`/api/v1/institutions/${institutionId}/teacher/classes/schedules?${params}`),
    "No se pudieron cargar tus horarios.",
  );
}

export async function fetchTeacherClassEnrollments(
  institutionId: string,
  classId: string,
  page: number,
  size: number,
): Promise<PaginatedResponse<CourseEnrollment>> {
  return parseHttpResponse(
    await institutionalApiFetch(`/api/v1/institutions/${institutionId}/teacher/classes/${classId}/enrollments?page=${page}&size=${size}`),
    "No se pudieron cargar las cursadas de esta clase.",
  );
}
