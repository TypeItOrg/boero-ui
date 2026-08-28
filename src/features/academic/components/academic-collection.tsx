import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
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
  const yearFilters = config.yearFilters?.(params) ?? [];
  const dateFilters = config.dateFilters?.(params) ?? [];
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
        <PlatformCollectionActions>{createAction}</PlatformCollectionActions>
        <AcademicTableFilters
          academicSpaceFilter={
            resource === AcademicResource.COURSE && effectiveInstitutionId
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
          cycleFilter={
            resource === AcademicResource.COURSE && effectiveInstitutionId
              ? {
                  institutionId: effectiveInstitutionId,
                  selectedLabel: params.year !== undefined ? String(params.year) : undefined,
                  scope,
                  value: params.year !== undefined ? String(params.year) : undefined,
                }
              : undefined
          }
          dateFilters={dateFilters}
          filters={filters}
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
            resource === AcademicResource.COURSE && effectiveInstitutionId
              ? {
                  institutionId: effectiveInstitutionId,
                  selectedLabel: selectedStudyPlan?.name,
                  scope,
                  value: params.studyPlanId,
                }
              : undefined
          }
          trainingPathFilter={
            resource === AcademicResource.STUDY_PLAN && !isTrainingPathFixed && effectiveInstitutionId
              ? {
                  institutionId: effectiveInstitutionId,
                  selectedLabel: selectedTrainingPath?.name,
                  scope,
                  value: params.trainingPathId,
                }
              : undefined
          }
          yearFilters={yearFilters}
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
      </DataTableNavigationProvider>
    </div>
  );
}
