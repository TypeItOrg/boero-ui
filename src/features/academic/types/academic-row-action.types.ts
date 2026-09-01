import type { AcademicResource } from "@features/academic/types/academic-resource.types";
import { ACADEMIC_ROW_ACTION_KIND } from "@features/academic/types/academic-row-action-kind.types";
import type { AcademicYearStatus } from "@features/academic/types/academic-year-status.types";
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";
import type { CourseStatus } from "@features/academic/types/course-status.types";

export type AcademicRowAction =
  | {
      href: string;
      kind: typeof ACADEMIC_ROW_ACTION_KIND.NAVIGATE;
      label: string;
      preserveReturnTo?: boolean;
    }
  | {
      kind: typeof ACADEMIC_ROW_ACTION_KIND.STATUS;
      label: string;
      resource: AcademicResource.ACADEMIC_YEAR;
      targetStatus: Exclude<AcademicYearStatus, "PLANNED">;
    }
  | {
      kind: typeof ACADEMIC_ROW_ACTION_KIND.STATUS;
      label: string;
      resource: AcademicResource.STUDY_PLAN;
      targetStatus: "ACTIVE" | "INACTIVE";
    }
  | {
      kind: typeof ACADEMIC_ROW_ACTION_KIND.STATUS;
      label: string;
      resource: AcademicResource.COURSE;
      targetStatus: CourseStatus;
    }
  | {
      kind: typeof ACADEMIC_ROW_ACTION_KIND.STATUS;
      label: string;
      resource: Exclude<ActiveAcademicStatusResource, AcademicResource.COURSE>;
      targetStatus: "ACTIVE" | "INACTIVE";
    }
  | {
      kind: typeof ACADEMIC_ROW_ACTION_KIND.DELETE;
      label: "Eliminar";
    }
  | {
      kind: typeof ACADEMIC_ROW_ACTION_KIND.RESTORE;
      label: "Restaurar";
    };
