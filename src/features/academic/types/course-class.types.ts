import type { CourseWeekDay } from "@features/academic/types/course-week-day.types";

export type CourseClass = {
  id: string;
  teachers: { personId: string; fullName: string }[];
  days: {
    dayOfWeek: CourseWeekDay;
    capacity: number | null;
    periodDurationMinutes: number | null;
    schedules: { startTime: string; endTime: string }[];
  }[];
};
