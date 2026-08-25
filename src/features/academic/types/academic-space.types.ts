import type { AcademicSpaceFormat } from "@features/academic/types/academic-space-format.types";
import type { AcademicSpaceType } from "@features/academic/types/academic-space-type.types";

export type AcademicSpace = {
  id: string;
  institutionId: string;
  institutionName?: string;
  name: string;
  description: string | null;
  type: AcademicSpaceType;
  format: AcademicSpaceFormat;
  active: boolean;
  deletedAt?: string | null;
};
