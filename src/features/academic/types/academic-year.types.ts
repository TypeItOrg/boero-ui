import type { AcademicYearStatus } from "@features/academic/types/academic-year-status.types";

export type AcademicYear = {
  id: string;
  institutionId: string;
  year: number;
  startDate: string | null;
  endDate: string | null;
  status: AcademicYearStatus;
};
