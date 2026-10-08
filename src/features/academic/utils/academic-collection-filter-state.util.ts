import { countActiveAdvancedFilters } from "@common/utils/count-active-advanced-filters.util";

import type { AcademicCollectionConfig } from "@features/academic/types/academic-collection-config.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicPaginationParams } from "@features/academic/utils/academic-pagination.util";

export function getAcademicCollectionFilters({
  config,
  params,
  resource,
  isTrainingPathFixed,
}: {
  config: AcademicCollectionConfig;
  params: AcademicPaginationParams;
  resource: AcademicCollectionResource;
  isTrainingPathFixed: boolean;
}) {
  const filters = config.filters(params);

  const isCourse = resource === AcademicResource.COURSE;

  const isAcademicYear = resource === AcademicResource.ACADEMIC_YEAR;

  const isStudyPlan = resource === AcademicResource.STUDY_PLAN;

  const isAcademicSpace = resource === AcademicResource.ACADEMIC_SPACE;

  const useAdvancedFilters = isCourse || isAcademicYear || isStudyPlan || isAcademicSpace;

  const advancedSelectFilterNames = new Set(isAcademicSpace ? ["type", "format", "deleted"] : ["deleted"]);

  const primarySelectFilters = useAdvancedFilters ? filters.filter((filter) => !advancedSelectFilterNames.has(filter.name)) : filters;

  const advancedSelectFilters = useAdvancedFilters ? filters.filter((filter) => advancedSelectFilterNames.has(filter.name)) : [];

  let customAdvancedFilters: readonly { active: boolean; key: string }[] = [];

  if (isCourse) {
    customAdvancedFilters = [
      { active: params.academicSpaceId !== undefined, key: "academicSpaceId" },
      { active: params.institutionId !== undefined, key: "institutionId" },
      { active: params.studyPlanId !== undefined, key: "studyPlanId" },
    ];
  } else if (isAcademicYear) {
    customAdvancedFilters = [{ active: params.institutionId !== undefined, key: "institutionId" }];
  } else if (isStudyPlan) {
    customAdvancedFilters = [
      { active: params.institutionId !== undefined, key: "institutionId" },
      ...(!isTrainingPathFixed ? [{ active: params.trainingPathId !== undefined, key: "trainingPathId" }] : []),
    ];
  } else if (isAcademicSpace) {
    customAdvancedFilters = [{ active: params.institutionId !== undefined, key: "institutionId" }];
  }

  const activeAdvancedCount = customAdvancedFilters.filter((filter) => filter.active).length;

  const advancedResetKeys = customAdvancedFilters.map((filter) => filter.key);

  const yearFilters = config.yearFilters?.(params) ?? [];

  const dateFilters = config.dateFilters?.(params) ?? [];

  const advancedYearFilters = isAcademicYear ? yearFilters : [];

  const advancedDateFilters = isAcademicYear || isStudyPlan ? dateFilters : [];

  const advancedBadgeCount = countActiveAdvancedFilters({
    activeAdvancedCount,
    advancedDateFilters,
    advancedSelectFilters,
    advancedYearFilters,
  });

  const hasFilters =
    params.search.length > 0 ||
    params.institutionId !== undefined ||
    (!isTrainingPathFixed && params.trainingPathId !== undefined) ||
    params.academicSpaceId !== undefined ||
    params.studyPlanId !== undefined ||
    params.year !== undefined ||
    filters.some((filter) => filter.name !== "deleted" && filter.value !== filter.defaultValue) ||
    yearFilters.some((filter) => filter.value !== filter.defaultValue) ||
    dateFilters.some((filter) => filter.value !== undefined) ||
    params.startDate !== undefined ||
    params.endDate !== undefined;

  return {
    isCourse,
    isAcademicYear,
    isStudyPlan,
    useAdvancedFilters,
    primarySelectFilters,
    advancedSelectFilters,
    activeAdvancedCount,
    advancedResetKeys,
    yearFilters,
    dateFilters,
    advancedYearFilters,
    advancedDateFilters,
    advancedBadgeCount,
    hasFilters,
  };
}
