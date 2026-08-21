import type { AcademicSortField } from "@features/academic/utils/academic-pagination.util";

export type AcademicTableColumns = {
  primaryLabel: string;
  detailLabels: readonly string[];
  sortableFields?: readonly (AcademicSortField | undefined)[];
};
