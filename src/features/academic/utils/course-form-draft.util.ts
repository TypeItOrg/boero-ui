"use client";

import { toOptionalFormString } from "@common/utils/form-value.util";

import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";
import { type DayDraft } from "@features/academic/types/course-day-draft.types";
import { type ScheduleDraft } from "@features/academic/types/course-schedule-draft.types";
import type { CourseWeekDay } from "@features/academic/types/course-week-day.types";
import { academicSpaceFormatLabels, academicSpaceTypeLabels } from "@features/academic/utils/academic-labels.util";

export function emptySchedule(): ScheduleDraft {
  return { startTime: "", endTime: "" };
}

export function emptyDay(dayOfWeek: CourseWeekDay): DayDraft {
  return { dayOfWeek, capacity: "", periodDurationMinutes: "", schedules: [emptySchedule()] };
}

export function parseInitialClasses(value: unknown): unknown[] {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(value) ? value : [];
}

export function individualFormat(format: string | undefined): boolean {
  return format === "INDIVIDUAL";
}

export function parseNullableInt(value: string): number | null {
  if (value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

export function parsePositiveInt(value: string): number | null {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function toMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);

  if (!match) {
    return -1;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export function formatCount(count: number, singular: string, plural: string): string {
  if (count === 0) {
    return `Sin ${plural}`;
  }

  return `${count} ${count === 1 ? singular : plural}`;
}

export function composeInitialSpaceLabel(initialValues: AcademicFieldsProps["initialValues"]): string | undefined {
  const name = toOptionalFormString(initialValues?.academicSpaceName);

  if (!name) {
    return undefined;
  }

  const type = toOptionalFormString(initialValues?.academicSpaceType);
  const format = toOptionalFormString(initialValues?.academicSpaceFormat);
  const parts = [
    name,
    type ? academicSpaceTypeLabels[type as keyof typeof academicSpaceTypeLabels] : undefined,
    format ? academicSpaceFormatLabels[format as keyof typeof academicSpaceFormatLabels] : undefined,
  ].filter(Boolean);

  return parts.join(" · ");
}
