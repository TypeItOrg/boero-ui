"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import type { PaginatedResponse } from "@common/types/paginated-response.types";

import { fetchEnrollmentCourses } from "@features/enrollment-applications/services/enrollment-spaces-client.service";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";
import type { EnrollmentWizardProps } from "@features/enrollment-applications/types/enrollment-wizard-props.types";

export function useEnrollmentCourseOptions({
  initialApplication,
  initialCourseOptions = [],
  initialCourseOptionsPage = 0,
  initialCourseOptionsTotalPages = 1,
}: EnrollmentWizardProps) {
  const queryClient = useQueryClient();

  const queryKey = ["enrollment-course-options", initialApplication.applicationId];

  const query = useInfiniteQuery({
    queryKey,
    initialPageParam: initialCourseOptionsPage,
    queryFn: ({ pageParam, signal }) => fetchEnrollmentCourses(initialApplication.applicationId, { page: pageParam, size: 50, signal }),
    initialData: () => ({
      pages: [
        {
          items: [...initialCourseOptions],
          page: initialCourseOptionsPage,
          size: 50,
          totalItems: initialCourseOptions.length,
          totalPages: initialCourseOptionsTotalPages,
        },
      ],
      pageParams: [initialCourseOptionsPage],
    }),
    getNextPageParam: (lastPage) => (lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined),
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
  });

  const courseOptions = [...new Map(query.data.pages.flatMap((page) => page.items).map((course) => [course.courseId, course])).values()];

  function rememberCourse(course: EnrollmentCourseOption): void {
    queryClient.setQueryData<typeof query.data>(queryKey, (previous) => {
      if (!previous) {
        return previous;
      }

      const exists = previous.pages.some((page) => page.items.some((item) => item.courseId === course.courseId));

      const pages: PaginatedResponse<EnrollmentCourseOption>[] = previous.pages.map((page, index) => ({
        ...page,
        items: !exists && index === 0 ? [...page.items, course] : page.items.map((item) => (item.courseId === course.courseId ? course : item)),
      }));

      return { ...previous, pages };
    });
  }

  function loadMoreCourseOptions(): void {
    if (query.isFetching || !query.hasNextPage) {
      return;
    }

    // The query owns the in-flight request, including repeated clicks before React renders.
    void query.fetchNextPage({ cancelRefetch: false });
  }

  return {
    courseOptions,
    rememberCourse,
    loadingMoreCourses: query.isFetchingNextPage,
    courseOptionsError: query.isFetchingNextPage ? undefined : query.error?.message,
    hasMoreCourseOptions: query.hasNextPage,
    loadMoreCourseOptions,
  };
}
