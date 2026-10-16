"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import type { PaginatedResponse } from "@common/types/paginated-response.types";

import {
  COURSE_ENROLLMENT_GRADE_HISTORY_PAGE_SIZE,
  COURSE_ENROLLMENT_GRADE_MESSAGES,
} from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import {
  fetchManagementGradeHistoryClient,
  fetchTeacherGradeHistoryClient,
} from "@features/course-enrollments/services/course-enrollment-grade-history-client.service";
import type { CourseEnrollmentGradeHistoryEvent } from "@features/course-enrollments/types/course-enrollment-grade-history-event.types";

type GradeHistoryIdentity = {
  mode: "institutional" | "teacher";
  enrollmentId: string;
  classId?: string;
  gradeId: string;
};

const EMPTY_HISTORY_PAGE: PaginatedResponse<CourseEnrollmentGradeHistoryEvent> = {
  items: [],
  page: 0,
  size: COURSE_ENROLLMENT_GRADE_HISTORY_PAGE_SIZE,
  totalItems: 0,
  totalPages: 0,
};

export function useCourseEnrollmentGradeHistory({ mode, enrollmentId, classId, gradeId }: GradeHistoryIdentity) {
  const [pagination, setPagination] = useState({
    mode,
    enrollmentId,
    classId,
    gradeId,
    page: 0,
    size: COURSE_ENROLLMENT_GRADE_HISTORY_PAGE_SIZE,
  });

  const identityChanged =
    pagination.mode !== mode || pagination.enrollmentId !== enrollmentId || pagination.classId !== classId || pagination.gradeId !== gradeId;

  if (identityChanged) {
    setPagination({ mode, enrollmentId, classId, gradeId, page: 0, size: pagination.size });
  }

  const page = identityChanged ? 0 : pagination.page;

  const { size } = pagination;

  const query = useQuery({
    queryKey: ["course-enrollment-grade-history", mode, enrollmentId, classId ?? "", gradeId, page, size],
    queryFn: async () => {
      if (mode === "teacher" && classId) {
        return fetchTeacherGradeHistoryClient(classId, enrollmentId, gradeId, page, size);
      }

      return fetchManagementGradeHistoryClient(enrollmentId, gradeId, page, size);
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
    placeholderData: (previous) => previous,
  });

  return {
    page,
    size,
    loading: query.isFetching,
    error: query.isError && !query.isFetching ? COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED : "",
    history: query.data ?? EMPTY_HISTORY_PAGE,
    retry: () => void query.refetch(),
    changePage: (nextPage: number) => setPagination((previous) => ({ ...previous, page: nextPage })),
    changeSize: (nextSize: number) => setPagination((previous) => ({ ...previous, page: 0, size: nextSize })),
  };
}
