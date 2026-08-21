import type { LucideIcon } from "lucide-react";

import type { DataTableDateFilter, DataTableSelectFilter, DataTableYearFilter } from "@common/components/ui/data-table-filters";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import type { AcademicFetchInput } from "@features/academic/types/academic-fetch-input.types";
import type { AcademicTableColumns } from "@features/academic/types/academic-table-columns.types";
import type { AcademicTableRow } from "@features/academic/types/academic-table-row.types";
import type { AcademicPaginationParams } from "@features/academic/utils/academic-pagination.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export type AcademicCollectionConfig = {
  canChangeStatus: (access: AcademicAccess) => boolean;
  canCreate: (access: AcademicAccess) => boolean;
  canDelete: (access: AcademicAccess) => boolean;
  canRead: (access: AcademicAccess) => boolean;
  canRestore: (access: AcademicAccess) => boolean;
  canUpdate: (access: AcademicAccess) => boolean;
  columns: AcademicTableColumns;
  createLabel: string;
  createIcon: LucideIcon;
  dateFilters?: (params: AcademicPaginationParams) => readonly DataTableDateFilter[];
  description: string;
  fetchDetail: (scope: AcademicScope, institutionId: string, id: string) => Promise<AcademicCollection | null>;
  fetchPage: (input: AcademicFetchInput) => Promise<PaginatedResponse<AcademicCollection>>;
  filters: (params: AcademicPaginationParams) => readonly DataTableSelectFilter[];
  getTitle: (item: AcademicCollection) => string;
  hasCurriculum?: boolean;
  plural: string;
  resource: AcademicCollectionResource;
  searchable?: boolean;
  searchPlaceholder?: string;
  singular: string;
  title: string;
  toRow: (item: AcademicCollection) => AcademicTableRow;
  yearFilters?: (params: AcademicPaginationParams) => readonly DataTableYearFilter[];
};
