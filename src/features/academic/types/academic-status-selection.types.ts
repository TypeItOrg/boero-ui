import type { AcademicYearStatus } from "@features/academic/types/academic-year-status.types";
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { CourseStatus } from "@features/academic/types/course-status.types";
import type { StudyPlanStatus } from "@features/academic/types/study-plan-status.types";

export type AcademicStatusSelection =
  | {
      academicYearLabel: string;
      id: string;
      resource: AcademicResource.ACADEMIC_YEAR;
      targetStatus: Exclude<AcademicYearStatus, "PLANNED">;
    }
  | {
      effectiveFrom: string | null;
      id: string;
      resource: AcademicResource.STUDY_PLAN;
      studyPlanLabel: string;
      targetStatus: Exclude<StudyPlanStatus, "DRAFT">;
    }
  | {
      id: string;
      resource: Extract<ActiveAcademicStatusResource, Exclude<ActiveAcademicStatusResource, AcademicResource.COURSE>>;
      resourceLabel: string;
      targetStatus: "ACTIVE" | "INACTIVE";
    }
  | {
      id: string;
      resource: AcademicResource.COURSE;
      resourceLabel: string;
      targetStatus: CourseStatus;
    };
