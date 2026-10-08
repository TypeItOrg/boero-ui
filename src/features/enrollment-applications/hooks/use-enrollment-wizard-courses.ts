"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

import type { z } from "zod";

import { fetchEnrollmentCourses } from "@features/enrollment-applications/services/enrollment-spaces-client.service";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";
import { type EnrollmentWizardProps } from "@features/enrollment-applications/types/enrollment-wizard-props.types";
import { enrollmentCourseGroupKey } from "@features/enrollment-applications/utils/enrollment-course-group.util";

export function useEnrollmentWizardCourses(
  { initialApplication, initialCourseOptions = [], initialCourseOptionsPage = 0, initialCourseOptionsTotalPages = 1 }: EnrollmentWizardProps,
  setValidationIssues: Dispatch<SetStateAction<z.ZodIssue[]>>,
) {
  const application = initialApplication;
  const initialData = initialApplication.data;
  // 6. Cursos
  const [courseOptions, setCourseOptions] = useState<EnrollmentCourseOption[]>(() => [...initialCourseOptions]);
  const [courseOptionsPage, setCourseOptionsPage] = useState(initialCourseOptionsPage);
  const [courseOptionsTotalPages, setCourseOptionsTotalPages] = useState(initialCourseOptionsTotalPages);
  const [loadingMoreCourses, setLoadingMoreCourses] = useState(false);
  const [courseOptionsError, setCourseOptionsError] = useState<string>();
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(() => (initialData?.courses ?? []).map((course) => course.courseId));
  const [pendingInstrumentGroups, setPendingInstrumentGroups] = useState<string[]>([]);
  const [invalidInstrumentGroups, setInvalidInstrumentGroups] = useState<string[]>([]);

  const hasMoreCourseOptions = courseOptionsPage + 1 < courseOptionsTotalPages;

  async function loadMoreCourseOptions(): Promise<void> {
    if (loadingMoreCourses || !hasMoreCourseOptions) {
      return;
    }

    setLoadingMoreCourses(true);
    setCourseOptionsError(undefined);

    try {
      const nextPage = await fetchEnrollmentCourses(application.applicationId, {
        page: courseOptionsPage + 1,
        size: 50,
      });
      setCourseOptions((previous) => [...new Map([...previous, ...nextPage.items].map((course) => [course.courseId, course])).values()]);
      setCourseOptionsPage(nextPage.page);
      setCourseOptionsTotalPages(nextPage.totalPages);
    } catch (error: unknown) {
      setCourseOptionsError(error instanceof Error ? error.message : "No se pudieron cargar más cursos.");
    } finally {
      setLoadingMoreCourses(false);
    }
  }

  const handleToggleCourse = (courseId: string, checked: boolean) => {
    setSelectedCourseIds((previous) => (checked ? Array.from(new Set([...previous, courseId])) : previous.filter((id) => id !== courseId)));
  };

  const handleToggleInstrumentGroup = (course: EnrollmentCourseOption, checked: boolean): void => {
    const key = enrollmentCourseGroupKey(course);
    setInvalidInstrumentGroups((previous) => previous.filter((item) => item !== key));

    if (checked) {
      setPendingInstrumentGroups((previous) => [...new Set([...previous, key])]);

      return;
    }

    const groupIds = new Set(
      [...courseOptions, ...(initialApplication.courses ?? [])].filter((item) => enrollmentCourseGroupKey(item) === key).map((item) => item.courseId),
    );
    setPendingInstrumentGroups((previous) => previous.filter((item) => item !== key));
    setSelectedCourseIds((previous) => previous.filter((id) => !groupIds.has(id)));
    setValidationIssues((previous) => previous.filter((issue) => issue.path[0] !== "courses"));
  };

  const handleSelectInstrument = (course: EnrollmentCourseOption): void => {
    const key = enrollmentCourseGroupKey(course);
    setInvalidInstrumentGroups((previous) => previous.filter((item) => item !== key));
    setPendingInstrumentGroups((previous) => previous.filter((item) => item !== key));
    setValidationIssues((previous) => previous.filter((issue) => issue.path[0] !== "courses"));
    const groupIds = new Set(
      [...courseOptions, ...(initialApplication.courses ?? [])].filter((item) => enrollmentCourseGroupKey(item) === key).map((item) => item.courseId),
    );
    setCourseOptions((previous) =>
      previous.some((item) => item.courseId === course.courseId)
        ? previous.map((item) => (item.courseId === course.courseId ? course : item))
        : [...previous, course],
    );
    setSelectedCourseIds((previous) => [...previous.filter((id) => !groupIds.has(id)), course.courseId]);
  };

  return {
    courseOptions,
    selectedCourseIds,
    pendingInstrumentGroups,
    invalidInstrumentGroups,
    setInvalidInstrumentGroups,
    loadingMoreCourses,
    courseOptionsError,
    hasMoreCourseOptions,
    loadMoreCourseOptions,
    handleToggleCourse,
    handleToggleInstrumentGroup,
    handleSelectInstrument,
  };
}
