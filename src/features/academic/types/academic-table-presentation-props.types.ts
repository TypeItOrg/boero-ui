import type { ReactNode } from "react";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";

import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicTableColumns } from "@features/academic/types/academic-table-columns.types";
import type { AcademicTableRow as AcademicTableRowData } from "@features/academic/types/academic-table-row.types";
import type { AcademicSort } from "@features/academic/utils/academic-pagination.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export type AcademicTablePresentationProps = PaginationParams & {
  basePath: string;
  canCreate: boolean;
  canCreateVersion?: boolean;
  canReadWaitlist?: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canChangeStatus: boolean;
  columns: AcademicTableColumns;
  createAction?: ReactNode;
  data: PaginatedResponse<AcademicTableRowData>;
  deleted: boolean;
  hasFilters: boolean;
  global?: boolean;
  institutionId?: string;
  canUpdate: boolean;
  plural: string;
  resource: AcademicCollectionResource;
  scope: AcademicScope;
  singular: string;
  sort: AcademicSort;
};
