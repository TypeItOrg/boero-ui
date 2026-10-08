"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

import type { z } from "zod";

import { useEnrollmentCourseOptions } from "@features/enrollment-applications/hooks/use-enrollment-course-options";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";
import { type EnrollmentWizardProps } from "@features/enrollment-applications/types/enrollment-wizard-props.types";
import { enrollmentCourseGroupKey } from "@features/enrollment-applications/utils/enrollment-course-group.util";

export function useEnrollmentWizardCourses(props: EnrollmentWizardProps, setValidationIssues: Dispatch<SetStateAction<z.ZodIssue[]>>) {
  const { initialApplication } = props;
  const initialData = initialApplication.data;
  const { courseOptions, rememberCourse, ...pagination } = useEnrollmentCourseOptions(props);

  const [selection, setSelection] = useState(() => ({
    selectedCourseIds: (initialData?.courses ?? []).map((course) => course.courseId),
    pendingInstrumentGroups: [] as string[],
    invalidInstrumentGroups: [] as string[],
  }));

  const { selectedCourseIds, pendingInstrumentGroups, invalidInstrumentGroups } = selection;

  function setInvalidInstrumentGroups(groups: string[]): void {
    setSelection((previous) => ({ ...previous, invalidInstrumentGroups: groups }));
  }

  const handleToggleCourse = (courseId: string, checked: boolean) => {
    setSelection((previous) => ({
      ...previous,
      selectedCourseIds: checked
        ? Array.from(new Set([...previous.selectedCourseIds, courseId]))
        : previous.selectedCourseIds.filter((id) => id !== courseId),
    }));
  };

  const handleToggleInstrumentGroup = (course: EnrollmentCourseOption, checked: boolean): void => {
    const key = enrollmentCourseGroupKey(course);

    if (checked) {
      setSelection((previous) => ({
        ...previous,
        invalidInstrumentGroups: previous.invalidInstrumentGroups.filter((item) => item !== key),
        pendingInstrumentGroups: [...new Set([...previous.pendingInstrumentGroups, key])],
      }));

      return;
    }

    const groupIds = new Set(
      [...courseOptions, ...(initialApplication.courses ?? [])].filter((item) => enrollmentCourseGroupKey(item) === key).map((item) => item.courseId),
    );

    setSelection((previous) => ({
      invalidInstrumentGroups: previous.invalidInstrumentGroups.filter((item) => item !== key),
      pendingInstrumentGroups: previous.pendingInstrumentGroups.filter((item) => item !== key),
      selectedCourseIds: previous.selectedCourseIds.filter((id) => !groupIds.has(id)),
    }));
    setValidationIssues((previous) => previous.filter((issue) => issue.path[0] !== "courses"));
  };

  const handleSelectInstrument = (course: EnrollmentCourseOption): void => {
    const key = enrollmentCourseGroupKey(course);

    const groupIds = new Set(
      [...courseOptions, ...(initialApplication.courses ?? [])].filter((item) => enrollmentCourseGroupKey(item) === key).map((item) => item.courseId),
    );

    rememberCourse(course);
    setSelection((previous) => ({
      invalidInstrumentGroups: previous.invalidInstrumentGroups.filter((item) => item !== key),
      pendingInstrumentGroups: previous.pendingInstrumentGroups.filter((item) => item !== key),
      selectedCourseIds: [...previous.selectedCourseIds.filter((id) => !groupIds.has(id)), course.courseId],
    }));
    setValidationIssues((previous) => previous.filter((issue) => issue.path[0] !== "courses"));
  };

  return {
    courseOptions,
    selectedCourseIds,
    pendingInstrumentGroups,
    invalidInstrumentGroups,
    setInvalidInstrumentGroups,
    ...pagination,
    handleToggleCourse,
    handleToggleInstrumentGroup,
    handleSelectInstrument,
  };
}
