import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";

import {
  COURSE_ENROLLMENT_GRADE_HISTORY_PAGE_SIZE,
  COURSE_ENROLLMENT_GRADE_MESSAGES,
} from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import type { CourseEnrollmentArchivedGrade } from "@features/course-enrollments/types/course-enrollment-archived-grade.types";
import type { CourseEnrollmentGradeHistoryEvent } from "@features/course-enrollments/types/course-enrollment-grade-history-event.types";

type GradeHistoryPagePayload = {
  content?: CourseEnrollmentGradeHistoryEvent[];
  number?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
};

function toGradeHistoryPage(
  payload: GradeHistoryPagePayload | CourseEnrollmentGradeHistoryEvent[],
): PaginatedResponse<CourseEnrollmentGradeHistoryEvent> {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: 0,
      size: payload.length,
      totalItems: payload.length,
      totalPages: payload.length > 0 ? 1 : 0,
    };
  }

  const items = payload.content ?? [];

  return {
    items,
    page: payload.number ?? 0,
    size: payload.size ?? items.length,
    totalItems: payload.totalElements ?? items.length,
    totalPages: payload.totalPages ?? (items.length > 0 ? 1 : 0),
  };
}

export async function fetchManagementGradeHistoryClient(
  enrollmentId: string,
  gradeId: string,
  page = 0,
  size = COURSE_ENROLLMENT_GRADE_HISTORY_PAGE_SIZE,
): Promise<PaginatedResponse<CourseEnrollmentGradeHistoryEvent>> {
  const response = await fetch(`/api/course-enrollments/${enrollmentId}/grades/${gradeId}/history?page=${page}&size=${size}`, {
    cache: "no-store",
  });

  const payload = await parseHttpResponse<GradeHistoryPagePayload | CourseEnrollmentGradeHistoryEvent[]>(
    response,
    COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED,
  );

  return toGradeHistoryPage(payload);
}

export async function fetchManagementArchivedGradesClient(enrollmentId: string): Promise<CourseEnrollmentArchivedGrade[]> {
  const response = await fetch(`/api/course-enrollments/${enrollmentId}/grades/archived`, {
    cache: "no-store",
  });

  return parseHttpResponse(response, COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED);
}

export async function fetchTeacherGradeHistoryClient(
  classId: string,
  enrollmentId: string,
  gradeId: string,
  page = 0,
  size = COURSE_ENROLLMENT_GRADE_HISTORY_PAGE_SIZE,
): Promise<PaginatedResponse<CourseEnrollmentGradeHistoryEvent>> {
  const response = await fetch(`/api/teacher/classes/${classId}/enrollments/${enrollmentId}/grades/${gradeId}/history?page=${page}&size=${size}`, {
    cache: "no-store",
  });

  const payload = await parseHttpResponse<GradeHistoryPagePayload | CourseEnrollmentGradeHistoryEvent[]>(
    response,
    COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED,
  );

  return toGradeHistoryPage(payload);
}

export async function fetchTeacherArchivedGradesClient(classId: string, enrollmentId: string): Promise<CourseEnrollmentArchivedGrade[]> {
  const response = await fetch(`/api/teacher/classes/${classId}/enrollments/${enrollmentId}/grades/archived`, { cache: "no-store" });

  return parseHttpResponse(response, COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED);
}
