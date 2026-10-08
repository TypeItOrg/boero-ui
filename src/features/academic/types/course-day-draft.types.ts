import { type ScheduleDraft } from "@features/academic/types/course-schedule-draft.types";
import type { CourseWeekDay } from "@features/academic/types/course-week-day.types";

export type DayDraft = {
  dayOfWeek: CourseWeekDay;
  capacity: string;
  periodDurationMinutes: string;
  schedules: ScheduleDraft[];
};
