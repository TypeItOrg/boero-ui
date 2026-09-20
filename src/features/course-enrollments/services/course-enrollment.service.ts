import "server-only";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse, parseNullableHttpResponse } from "@common/utils/http-response-error.util";
import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import type { CourseWaitlistEntry } from "@features/course-enrollments/types/course-waitlist-entry.types";
import type { CourseEnrollmentHistory } from "@features/course-enrollments/types/course-enrollment-history.types";

export type CourseEnrollmentListParams = {
  page?: number;
  size?: number;
  status?: CourseEnrollmentStatus;
  academicStatus?: AcademicEnrollmentStatus;
};

function courseEnrollmentSearchParams(params: CourseEnrollmentListParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 20),
    sort: "enrolledAt,desc",
  });

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.academicStatus) {
    searchParams.set("academicStatus", params.academicStatus);
  }

  return searchParams;
}

export async function fetchMyCourseEnrollments(
  institutionId: string,
  params: CourseEnrollmentListParams = {},
): Promise<PaginatedResponse<CourseEnrollment>> {
  const searchParams = courseEnrollmentSearchParams(params);
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/course-enrollments/mine?${searchParams}`);

  return parseHttpResponse(response, "No se pudieron obtener tus cursadas.");
}

export async function fetchInstitutionalCourseEnrollments(
  institutionId: string,
  params: CourseEnrollmentListParams = {},
): Promise<PaginatedResponse<CourseEnrollment>> {
  const searchParams = courseEnrollmentSearchParams(params);
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/course-enrollments?${searchParams}`);

  return parseHttpResponse(response, "No se pudieron obtener las cursadas.");
}

export async function fetchCourseWaitlist(institutionId: string, courseId: string): Promise<CourseWaitlistEntry[] | null> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/courses/${courseId}/waitlist`);

  return parseNullableHttpResponse(response, "No se pudo obtener la lista de espera.");
}

export async function fetchPlatformCourseWaitlist(institutionId: string, courseId: string): Promise<CourseWaitlistEntry[] | null> {
  const response = await platformApiFetch(`/api/v1/institutions/${institutionId}/courses/${courseId}/waitlist`);

  return parseNullableHttpResponse(response, "No se pudo obtener la lista de espera.");
}

export async function fetchCourseEnrollment(institutionId: string, enrollmentId: string): Promise<CourseEnrollment | null> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/course-enrollments/${enrollmentId}`);

  return parseNullableHttpResponse(response, "No se pudo obtener la cursada.");
}

export async function fetchCourseEnrollmentHistory(institutionId: string, enrollmentId: string): Promise<CourseEnrollmentHistory[]> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/course-enrollments/${enrollmentId}/history`);

  return parseHttpResponse(response, "No se pudo obtener el historial de la cursada.");
}
