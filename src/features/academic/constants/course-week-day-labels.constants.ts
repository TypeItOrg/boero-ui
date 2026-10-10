"use client";

import type { CourseWeekDay } from "@features/academic/types/course-week-day.types";

export const WEEK_DAY_LABELS: Record<CourseWeekDay, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
};
