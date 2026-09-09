import type { FormValue } from "@common/types/form-value.types";
import type { AcademicLevel } from "@features/academic/types/academic-level.types";
import type { AcademicSpace } from "@features/academic/types/academic-space.types";
import type { Instrument } from "@features/academic/types/instrument.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export type AcademicFormOptions = {
  academicSpaces?: AcademicSpace[];
  canChangeStatus?: boolean;
  excludedPlanSpaceId?: string;
  initialValues?: Record<string, FormValue>;
  levels?: AcademicLevel[];
  planSpaces?: StudyPlanSpace[];
  selectedInstrumentIds?: string[];
  trainingPaths?: TrainingPath[];
  institutionId?: string;
  instruments?: Instrument[];
  scope?: AcademicScope;
  trainingPathLocked?: boolean;
};
