import "server-only";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { CourseEnrollmentGrade } from "@features/course-enrollments/types/course-enrollment-grade.types";
import type { CourseEnrollmentStudentGrade } from "@features/course-enrollments/types/course-enrollment-student-grade.types";
import type { PendingGradesSummary } from "@features/course-enrollments/types/pending-grades-summary.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function fetchManagementGrades(institutionId: string, enrollmentId: string): Promise<CourseEnrollmentGrade[]> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/course-enrollments/${enrollmentId}/grades`);

  return parseHttpResponse(response, "No se pudieron cargar las notas.");
}

export async function fetchPendingSummary(institutionId: string, classId: string): Promise<PendingGradesSummary> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/course-classes/${classId}/grades/pending-summary`);

  return parseHttpResponse(response, "No se pudo obtener el resumen de cambios.");
}

export async function fetchTeacherManagementGrades(
  institutionId: string,
  classId: string,
  enrollmentId: string,
): Promise<CourseEnrollmentGrade[]> {
  const response = await institutionalApiFetch(
    `/api/v1/institutions/${institutionId}/teacher/classes/${classId}/enrollments/${enrollmentId}/grades`,
  );

  return parseHttpResponse(response, "No se pudieron cargar las notas.");
}

export async function fetchTeacherPendingSummary(institutionId: string, classId: string): Promise<PendingGradesSummary> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/teacher/classes/${classId}/grades/pending-summary`);

  return parseHttpResponse(response, "No se pudo obtener el resumen de cambios.");
}

export async function fetchOwnPublishedGrades(institutionId: string, enrollmentId: string): Promise<CourseEnrollmentStudentGrade[]> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/course-enrollments/mine/${enrollmentId}/grades`);

  return parseHttpResponse(response, "No se pudieron cargar las notas publicadas.");
}
