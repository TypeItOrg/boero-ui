"use client";

import { useQuery } from "@tanstack/react-query";

import { getErrorMessage } from "@common/utils/error-message.util";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { COURSE_ENROLLMENT_MESSAGES } from "@features/course-enrollments/constants/course-enrollment.constants";
import { fetchCourseEnrollmentOptions } from "@features/course-enrollments/services/course-enrollment-client.service";
import { fetchPlatformCourseEnrollmentOptions } from "@features/course-enrollments/services/platform-course-enrollment-client.service";

export function useCourseEnrollmentOptions({
  courseId,
  institutionId,
  scope = AcademicScope.INSTITUTIONAL,
  enabled = true,
  revision = 0,
}: {
  courseId: string;
  institutionId?: string;
  scope?: AcademicScope;
  enabled?: boolean;
  revision?: number;
}) {
  const hasInstitution = scope !== AcademicScope.ADMIN || Boolean(institutionId);

  const query = useQuery({
    queryKey: ["course-enrollment-options", scope, institutionId, courseId, revision],
    enabled: enabled && Boolean(courseId) && hasInstitution,
    queryFn: ({ signal }) => {
      if (scope === AcademicScope.ADMIN) {
        if (!institutionId) {
          throw new Error(COURSE_ENROLLMENT_MESSAGES.ASSIGNMENTS_FAILED);
        }

        return fetchPlatformCourseEnrollmentOptions(institutionId, courseId, signal);
      }

      return fetchCourseEnrollmentOptions(courseId, signal);
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const error = hasInstitution ? getErrorMessage(query.error) : COURSE_ENROLLMENT_MESSAGES.ASSIGNMENTS_FAILED;

  return {
    options: query.data,
    error,
    loading: enabled && Boolean(courseId) && query.isPending && !error,
  };
}
