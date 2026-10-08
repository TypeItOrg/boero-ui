import type { PaginationParams } from "@common/types/pagination-params.types";
import type { PaginationSearchParams } from "@common/types/pagination-search-params.types";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";
import { ACADEMIC_ENROLLMENT_STATUS, type AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";

export const DEFAULT_COURSE_ENROLLMENT_PAGE_SIZE = 10;

export const COURSE_ENROLLMENT_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;

const COURSE_ENROLLMENT_STATUSES: readonly string[] = ["ENROLLED", "COMPLETED", "WITHDRAWN", "ADMINISTRATIVELY_WITHDRAWN"];

const ACADEMIC_ENROLLMENT_STATUSES: readonly string[] = Object.values(ACADEMIC_ENROLLMENT_STATUS);

export type CourseEnrollmentSearchParams = PaginationSearchParams & {
  status?: string;
  academicStatus?: string;
};

export type CourseEnrollmentPaginationParams = PaginationParams & {
  status?: CourseEnrollmentStatus;
  academicStatus?: AcademicEnrollmentStatus;
};

function parseStatus(value: string | undefined): CourseEnrollmentStatus | undefined {
  return typeof value === "string" && COURSE_ENROLLMENT_STATUSES.includes(value) ? (value as CourseEnrollmentStatus) : undefined;
}

function parseAcademicStatus(value: string | undefined): AcademicEnrollmentStatus | undefined {
  return typeof value === "string" && ACADEMIC_ENROLLMENT_STATUSES.includes(value) ? (value as AcademicEnrollmentStatus) : undefined;
}

export function parseCourseEnrollmentPaginationParams(searchParams: CourseEnrollmentSearchParams): CourseEnrollmentPaginationParams {
  const { page, size } = parsePaginationQuery(searchParams, {
    allowedPageSizes: new Set<number>(COURSE_ENROLLMENT_PAGE_SIZE_OPTIONS),
    defaultSize: DEFAULT_COURSE_ENROLLMENT_PAGE_SIZE,
  });

  return {
    page,
    size,
    status: parseStatus(searchParams.status),
    academicStatus: parseAcademicStatus(searchParams.academicStatus),
  };
}
