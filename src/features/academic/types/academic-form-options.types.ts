import type { FormValue } from "@common/types/form-value.types";
import type { AcademicLevel } from "@features/academic/types/academic-level.types";
import type { AcademicSpace } from "@features/academic/types/academic-space.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export type AcademicFormOptions = {
  academicSpaces?: AcademicSpace[];
  excludedPlanSpaceId?: string;
  initialValues?: Record<string, FormValue>;
  levels?: AcademicLevel[];
  planSpaces?: StudyPlanSpace[];
  trainingPaths?: TrainingPath[];
  institutionId?: string;
  scope?: AcademicScope;
  trainingPathLocked?: boolean;
};
