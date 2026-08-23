import type { AcademicSpaceType } from "@features/academic/types/academic-space-type.types";

export type AcademicSpace = {
  id: string;
  institutionId: string;
  institutionName?: string;
  name: string;
  description: string | null;
  type: AcademicSpaceType;
  active: boolean;
  deletedAt?: string | null;
};
