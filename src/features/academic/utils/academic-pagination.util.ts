import type { PaginationParams } from "@common/types/pagination-params.types";
import type { PaginationSearchParams } from "@common/types/pagination-search-params.types";
import type { QueryParamValue } from "@common/types/query-param.types";
import { parseOptionalBooleanQueryParam, parseUuidQueryParam } from "@common/utils/query-param.util";
import { PAGE_SIZE_OPTIONS, parsePaginationQuery } from "@common/utils/pagination-query.util";
import { parseSortQuery, type Sort, type SortSearchParams } from "@common/utils/sort-query.util";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { ACADEMIC_SPACE_TYPE, type AcademicSpaceType } from "@features/academic/types/academic-space-type.types";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import { ACADEMIC_YEAR_STATUS, type AcademicYearStatus } from "@features/academic/types/academic-year-status.types";
import { STUDY_PLAN_STATUS, type StudyPlanStatus } from "@features/academic/types/study-plan-status.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import { parseAcademicDateFilter, parseAcademicYearFilter } from "@features/academic/utils/academic-year.util";
import { ACADEMIC_SPACE_FORMAT, type AcademicSpaceFormat } from "@features/academic/types/academic-space-format.types";

export const ACADEMIC_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;
export const ACADEMIC_YEAR_SORT_FIELDS = ["year", "startDate", "endDate"] as const satisfies readonly (keyof AcademicYear)[];
export const TRAINING_PATH_SORT_FIELDS = ["name"] as const satisfies readonly (keyof TrainingPath)[];
export const STUDY_PLAN_SORT_FIELDS = ["name", "effectiveFrom", "effectiveTo"] as const satisfies readonly (keyof StudyPlan)[];

export type AcademicYearSortField = (typeof ACADEMIC_YEAR_SORT_FIELDS)[number];
export type TrainingPathSortField = (typeof TRAINING_PATH_SORT_FIELDS)[number];
export type StudyPlanSortField = (typeof STUDY_PLAN_SORT_FIELDS)[number];
export type AcademicSortField = AcademicYearSortField | TrainingPathSortField | StudyPlanSortField;
export type AcademicYearSort = Sort<AcademicYearSortField>;
export type TrainingPathSort = Sort<TrainingPathSortField>;
export type StudyPlanSort = Sort<StudyPlanSortField>;
export type AcademicSort = Sort<AcademicSortField>;

export const DEFAULT_ACADEMIC_YEAR_SORT = {
  field: "year",
  direction: "asc",
} as const satisfies AcademicYearSort;
export const DEFAULT_TRAINING_PATH_SORT = {
  field: "name",
  direction: "asc",
} as const satisfies TrainingPathSort;
export const DEFAULT_STUDY_PLAN_SORT = {
  field: "name",
  direction: "asc",
} as const satisfies StudyPlanSort;

const DEFAULT_PAGE_SIZE = 10;
const academicYearSortFields = new Set<AcademicYearSortField>(ACADEMIC_YEAR_SORT_FIELDS);
const trainingPathSortFields = new Set<TrainingPathSortField>(TRAINING_PATH_SORT_FIELDS);
const studyPlanSortFields = new Set<StudyPlanSortField>(STUDY_PLAN_SORT_FIELDS);

export type AcademicSearchParams = PaginationSearchParams &
  SortSearchParams & {
    active?: QueryParamValue;
    deleted?: QueryParamValue;
    endDate?: QueryParamValue;
    format?: QueryParamValue;
    institutionId?: QueryParamValue;
    trainingPathId?: QueryParamValue;
    validOn?: QueryParamValue;
    status?: QueryParamValue;
    startDate?: QueryParamValue;
    type?: QueryParamValue;
    year?: QueryParamValue;
  };

export type AcademicPaginationParams = PaginationParams & {
  active: boolean | undefined;
  deleted: boolean;
  endDate: string | undefined;
  format: AcademicSpaceFormat | undefined;
  institutionId: string | undefined;
  search: string;
  sort: AcademicSort;
  startDate: string | undefined;
  status: AcademicYearStatus | StudyPlanStatus | undefined;
  trainingPathId: string | undefined;
  type: AcademicSpaceType | undefined;
  validOn: string | undefined;
  year: number | undefined;
};

export function parseAcademicPaginationParams(
  searchParams: AcademicSearchParams,
  resource: AcademicCollectionResource = AcademicResource.ACADEMIC_YEAR,
): AcademicPaginationParams {
  const pagination = parsePaginationQuery(searchParams, {
    allowedPageSizes: new Set<number>(ACADEMIC_PAGE_SIZE_OPTIONS),
    defaultSize: DEFAULT_PAGE_SIZE,
  });

  return {
    ...pagination,
    active: parseOptionalBooleanQueryParam(searchParams.active),
    deleted: parseOptionalBooleanQueryParam(searchParams.deleted) ?? false,
    endDate: parseAcademicDateFilter(searchParams.endDate),
    format: parseEnum(searchParams.format, ACADEMIC_SPACE_FORMAT),
    institutionId: parseUuidQueryParam(searchParams.institutionId),
    startDate: parseAcademicDateFilter(searchParams.startDate),
    sort: parseAcademicSort(searchParams, resource),
    status: parseEnum(searchParams.status, [...ACADEMIC_YEAR_STATUS, ...STUDY_PLAN_STATUS]),
    trainingPathId: parseUuidQueryParam(searchParams.trainingPathId),
    type: parseEnum(searchParams.type, ACADEMIC_SPACE_TYPE),
    validOn: parseAcademicDateFilter(searchParams.validOn),
    year: parseAcademicYearFilter(searchParams.year),
  };
}

function parseAcademicSort(searchParams: AcademicSearchParams, resource: AcademicCollectionResource): AcademicSort {
  if (resource === AcademicResource.TRAINING_PATH) {
    return parseSortQuery(searchParams, trainingPathSortFields, DEFAULT_TRAINING_PATH_SORT);
  }
  if (resource === AcademicResource.STUDY_PLAN) {
    return parseSortQuery(searchParams, studyPlanSortFields, DEFAULT_STUDY_PLAN_SORT);
  }
  return parseSortQuery(searchParams, academicYearSortFields, DEFAULT_ACADEMIC_YEAR_SORT);
}

export function getAcademicRegistrationSummary(totalItems: number, singular: string, plural: string): string {
  const label = totalItems === 1 ? singular : plural;
  const participle = totalItems === 1 ? "registrado" : "registrados";

  return `${totalItems} ${label} ${participle}.`;
}

function parseEnum<T extends string>(value: QueryParamValue, allowedValues: readonly T[]): T | undefined {
  if (typeof value !== "string") return undefined;
  return allowedValues.find((allowedValue) => allowedValue === value);
}
