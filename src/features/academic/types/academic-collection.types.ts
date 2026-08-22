import type { AcademicSpace } from "@features/academic/types/academic-space.types";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import type { Instrument } from "@features/academic/types/instrument.types";
import type { Shift } from "@features/academic/types/shift.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";

export type AcademicCollection = AcademicYear | TrainingPath | StudyPlan | AcademicSpace | Instrument | Shift;
