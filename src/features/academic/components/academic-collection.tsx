import { DataTableAdvancedFiltersTrigger } from "@common/components/ui/data-table-advanced-filters-trigger";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { Sheet } from "@common/components/ui/sheet";
import { countActiveAdvancedFilters } from "@common/utils/count-active-advanced-filters.util";
import { AcademicTableFilters } from "@features/academic/components/academic-table-filters";
import { AcademicTablePresentation } from "@features/academic/components/academic-table-presentation";
import { ACADEMIC_COLLECTION_CONFIG, type AcademicTableColumns } from "@features/academic/config/academic-collection.config";
import { fetchAcademicSpace, fetchStudyPlan, fetchTrainingPath } from "@features/academic/services/academic.service";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { parseAcademicPaginationParams, type AcademicSearchParams } from "@features/academic/utils/academic-pagination.util";
import { academicSpaceFormatLabels, academicSpaceTypeLabels } from "@features/academic/utils/academic-labels.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { PlatformCollectionActions } from "@features/platform-auth/components/platform-collection-actions";

type AcademicCollectionProps = {
  basePath: string;
  canCreate: boolean;
  canCreateVersion?: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  canUpdate: boolean;
  canRestore: boolean;
  columns?: AcademicTableColumns;
  createAction?: React.ReactNode;
  fixedTrainingPathId?: string;
  global?: boolean;
  institutionId?: string;
  institutionName?: string;
  resource: AcademicCollectionResource;
  scope: AcademicScope;
  searchParams: AcademicSearchParams;
};

export async function AcademicCollectionView({
  basePath,
  canCreate,
  canCreateVersion = canCreate,
  canDelete,
  canChangeStatus,
  canUpdate,
  canRestore,
  columns,
  createAction,
  fixedTrainingPathId,
  global = false,
  institutionId,
  institutionName,
  resource,
  scope,
  searchParams,
}: AcademicCollectionProps): Promise<React.ReactElement> {
  const config = ACADEMIC_COLLECTION_CONFIG[resource];
  const isTrainingPathFixed = fixedTrainingPathId !== undefined;
  const parsedParams = parseAcademicPaginationParams(searchParams, resource);
  const params = isTrainingPathFixed ? { ...parsedParams, trainingPathId: fixedTrainingPathId } : parsedParams;
  const effectiveInstitutionId = global ? params.institutionId : institutionId;
  const dataPromise = config.fetchPage({ ...params, global, institutionId: effectiveInstitutionId, scope });
  const trainingPathId = params.trainingPathId;
  const shouldFetchTrainingPath = resource === AcademicResource.STUDY_PLAN && trainingPathId && !isTrainingPathFixed;
  const selectedTrainingPathPromise =
    shouldFetchTrainingPath && effectiveInstitutionId ? fetchTrainingPath(scope, effectiveInstitutionId, trainingPathId) : Promise.resolve(null);
  const [data, selectedTrainingPath] = await Promise.all([dataPromise, selectedTrainingPathPromise]);
  const selectedStudyPlanPromise =
    resource === AcademicResource.COURSE && params.studyPlanId && effectiveInstitutionId
      ? fetchStudyPlan(scope, effectiveInstitutionId, params.studyPlanId)
      : Promise.resolve(null);
  const selectedSpacePromise =
    resource === AcademicResource.COURSE && params.academicSpaceId && effectiveInstitutionId
      ? fetchAcademicSpace(scope, effectiveInstitutionId, params.academicSpaceId)
      : Promise.resolve(null);
  const [selectedStudyPlan, selectedAcademicSpace] = await Promise.all([selectedStudyPlanPromise, selectedSpacePromise]);
  const rows = data.items.map(config.toRow).map((row) => {
    if (!isTrainingPathFixed || resource !== AcademicResource.STUDY_PLAN) return row;
    return { ...row, detailValues: row.detailValues.slice(1) };
  });
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
    filters.some((filter) => filter.value !== filter.defaultValue) ||
    yearFilters.some((filter) => filter.value !== filter.defaultValue) ||
    dateFilters.some((filter) => filter.value !== undefined) ||
    params.startDate !== undefined ||
    params.endDate !== undefined;

  return (
    <div className="flex h-full flex-col gap-4">
      <DataTableNavigationProvider>
        <Sheet>
          <PlatformCollectionActions className={useAdvancedFilters && createAction ? "sm:justify-between" : undefined}>
            {useAdvancedFilters ? (
              <>
                {createAction}
                <DataTableAdvancedFiltersTrigger count={advancedBadgeCount} label="Filtros avanzados" />
              </>
            ) : (
              createAction
            )}
          </PlatformCollectionActions>
          <AcademicTableFilters
            academicSpaceFilter={
              isCourse && effectiveInstitutionId
                ? {
                    institutionId: effectiveInstitutionId,
                    selectedLabel: selectedAcademicSpace
                      ? `${selectedAcademicSpace.name} · ${academicSpaceTypeLabels[selectedAcademicSpace.type]} · ${academicSpaceFormatLabels[selectedAcademicSpace.format]}`
                      : undefined,
                    scope,
                    value: params.academicSpaceId,
                  }
                : undefined
            }
            activeAdvancedCount={activeAdvancedCount}
            advancedDateFilters={advancedDateFilters}
            advancedResetKeys={advancedResetKeys}
            advancedSelectFilters={advancedSelectFilters}
            advancedYearFilters={advancedYearFilters}
            cycleFilter={
              isCourse && effectiveInstitutionId
                ? {
                    institutionId: effectiveInstitutionId,
                    selectedLabel: params.year !== undefined ? String(params.year) : undefined,
                    scope,
                    value: params.year !== undefined ? String(params.year) : undefined,
                  }
                : undefined
            }
            dateFilters={isAcademicYear || isStudyPlan ? [] : dateFilters}
            filters={primarySelectFilters}
            institutionFilter={
              global
                ? {
                    selectedLabel: institutionName,
                    value: params.institutionId,
                  }
                : undefined
            }
            search={params.search}
            searchable={config.searchable !== false}
            searchPlaceholder={global ? "Buscar por registro o institución..." : config.searchPlaceholder}
            size={params.size}
            studyPlanFilter={
              isCourse && effectiveInstitutionId
                ? {
                    institutionId: effectiveInstitutionId,
                    selectedLabel: selectedStudyPlan?.name,
                    scope,
                    value: params.studyPlanId,
                  }
                : undefined
            }
            trainingPathFilter={
              isStudyPlan && !isTrainingPathFixed && effectiveInstitutionId
                ? {
                    institutionId: effectiveInstitutionId,
                    selectedLabel: selectedTrainingPath?.name,
                    scope,
                    value: params.trainingPathId,
                  }
                : undefined
            }
            triggerPosition={useAdvancedFilters ? "external" : undefined}
            yearFilters={isAcademicYear ? [] : yearFilters}
          />
          <AcademicTablePresentation
            basePath={basePath}
            canChangeStatus={canChangeStatus}
            canDelete={canDelete}
            canRestore={canRestore}
            canUpdate={canUpdate}
            data={{ ...data, items: rows }}
            global={global}
            institutionId={effectiveInstitutionId}
            canCreate={canCreate && !isTrainingPathFixed}
            canCreateVersion={canCreateVersion}
            deleted={params.deleted}
            page={params.page}
            resource={resource}
            hasFilters={hasFilters}
            scope={scope}
            sort={params.sort}
            size={params.size}
            plural={config.plural}
            singular={config.singular}
            columns={columns ?? config.columns}
            createAction={createAction}
          />
        </Sheet>
      </DataTableNavigationProvider>
    </div>
  );
}
