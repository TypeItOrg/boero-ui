import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import type { CourseEnrollmentGrade } from "@features/course-enrollments/types/course-enrollment-grade.types";
import type { CourseEnrollmentStudentGrade } from "@features/course-enrollments/types/course-enrollment-student-grade.types";
import type { PendingGradesSummary } from "@features/course-enrollments/types/pending-grades-summary.types";

export async function fetchManagementGradesClient(enrollmentId: string): Promise<CourseEnrollmentGrade[]> {
  const response = await fetch(`/api/course-enrollments/${enrollmentId}/grades`, { cache: "no-store" });

  return parseHttpResponse(response, COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED);
}

export async function fetchTeacherGradesClient(classId: string, enrollmentId: string): Promise<CourseEnrollmentGrade[]> {
  const response = await fetch(`/api/teacher/classes/${classId}/enrollments/${enrollmentId}/grades`, { cache: "no-store" });

  return parseHttpResponse(response, COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED);
}

export async function fetchTeacherPendingSummaryClient(classId: string): Promise<PendingGradesSummary> {
  const response = await fetch(`/api/teacher/classes/${classId}/grades/pending-summary`, { cache: "no-store" });

  return parseHttpResponse(response, COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED);
}

export async function fetchClassPendingSummaryClient(classId: string): Promise<PendingGradesSummary> {
  const response = await fetch(`/api/course-classes/${classId}/grades/pending-summary`, { cache: "no-store" });

  return parseHttpResponse(response, COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED);
}

export async function fetchStudentGradesClient(enrollmentId: string): Promise<CourseEnrollmentStudentGrade[]> {
  const response = await fetch(`/api/my-course-enrollments/${enrollmentId}/grades`, { cache: "no-store" });

  return parseHttpResponse(response, COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED);
}
