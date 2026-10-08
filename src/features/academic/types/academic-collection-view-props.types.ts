import type { ReactNode } from "react";

import { type AcademicTableColumns } from "@features/academic/config/academic-collection.config";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { type AcademicSearchParams } from "@features/academic/utils/academic-pagination.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export type AcademicCollectionProps = {
  basePath: string;
  canCreate: boolean;
  canCreateVersion?: boolean;
  canReadWaitlist?: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  canUpdate: boolean;
  canRestore: boolean;
  columns?: AcademicTableColumns;
  createAction?: ReactNode;
  fixedTrainingPathId?: string;
  global?: boolean;
  institutionId?: string;
  institutionName?: string;
  resource: AcademicCollectionResource;
  scope: AcademicScope;
  searchParams: AcademicSearchParams;
};
