import "server-only";

import { academicSpaceCollectionConfig } from "@features/academic/config/academic-space-collection.config";
import { academicYearCollectionConfig } from "@features/academic/config/academic-year-collection.config";
import { courseCollectionConfig } from "@features/academic/config/course-collection.config";
import { instrumentCollectionConfig } from "@features/academic/config/instrument-collection.config";
import { studyPlanCollectionConfig } from "@features/academic/config/study-plan-collection.config";
import { trainingPathCollectionConfig } from "@features/academic/config/training-path-collection.config";
import type { AcademicCollectionConfig } from "@features/academic/types/academic-collection-config.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicTableColumns } from "@features/academic/types/academic-table-columns.types";
import type { AcademicTableRow } from "@features/academic/types/academic-table-row.types";

export type { AcademicCollectionConfig, AcademicTableColumns, AcademicTableRow };

export const ACADEMIC_COLLECTION_CONFIG: Record<AcademicCollectionResource, AcademicCollectionConfig> = {
  [AcademicResource.ACADEMIC_YEAR]: academicYearCollectionConfig,
  [AcademicResource.TRAINING_PATH]: trainingPathCollectionConfig,
  [AcademicResource.STUDY_PLAN]: studyPlanCollectionConfig,
  [AcademicResource.ACADEMIC_SPACE]: academicSpaceCollectionConfig,
  [AcademicResource.INSTRUMENT]: instrumentCollectionConfig,
  [AcademicResource.COURSE]: courseCollectionConfig,
};
