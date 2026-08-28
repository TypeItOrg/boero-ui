import type { AcademicSpaceFormat } from "@features/academic/types/academic-space-format.types";
import type { AcademicSpaceType } from "@features/academic/types/academic-space-type.types";
import type { CourseClass } from "@features/academic/types/course-class.types";
import type { CourseStatus } from "@features/academic/types/course-status.types";

export type Course = {
  id: string;
  institutionId: string;
  institutionName?: string;
  studyPlanId: string;
  studyPlanName: string;
  trainingPathId: string;
  trainingPathName: string;
  academicSpaceId: string;
  academicSpaceName: string;
  academicSpaceType: AcademicSpaceType;
  academicSpaceFormat: AcademicSpaceFormat;
  academicYearId: string;
  year: number;
  status: CourseStatus;
  active: boolean;
  classes: CourseClass[];
  deletedAt?: string | null;
};
