import { type DayDraft } from "@features/academic/types/course-day-draft.types";

export type ClassDraft = {
  teachers: { personId: string; fullName: string }[];
  days: DayDraft[];
};
