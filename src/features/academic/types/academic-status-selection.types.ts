import type { AcademicYearStatus } from "@features/academic/types/academic-year-status.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { StudyPlanStatus } from "@features/academic/types/study-plan-status.types";

export type AcademicStatusSelection =
  | {
      academicYearLabel: string;
      id: string;
      label: string;
      resource: AcademicResource.ACADEMIC_YEAR;
      targetStatus: Exclude<AcademicYearStatus, "PLANNED">;
    }
  | {
      effectiveFrom: string | null;
      id: string;
      label: string;
      resource: AcademicResource.STUDY_PLAN;
      studyPlanLabel: string;
      targetStatus: Exclude<StudyPlanStatus, "DRAFT">;
    }
  | {
      id: string;
      label: string;
      resource: AcademicResource.TRAINING_PATH;
      targetStatus: "ACTIVE" | "INACTIVE";
      trainingPathLabel: string;
    };
