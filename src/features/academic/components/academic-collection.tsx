import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { AcademicTableFilters } from "@features/academic/components/academic-table-filters";
import { AcademicTablePresentation } from "@features/academic/components/academic-table-presentation";
import { ACADEMIC_COLLECTION_CONFIG, type AcademicTableColumns } from "@features/academic/config/academic-collection.config";
import { fetchTrainingPath } from "@features/academic/services/academic.service";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { parseAcademicPaginationParams, type AcademicSearchParams } from "@features/academic/utils/academic-pagination.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicCollectionProps = {
  basePath: string;
  canCreate: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  canUpdate: boolean;
  canRestore: boolean;
  columns?: AcademicTableColumns;
  fixedTrainingPathId?: string;
  institutionId: string;
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
  fixedTrainingPathId,
  institutionId,
  resource,
  scope,
  searchParams,
}: AcademicCollectionProps): Promise<React.ReactElement> {
  const config = ACADEMIC_COLLECTION_CONFIG[resource];
  const isTrainingPathFixed = fixedTrainingPathId !== undefined;
  const parsedParams = parseAcademicPaginationParams(searchParams, resource);
  const params = isTrainingPathFixed ? { ...parsedParams, trainingPathId: fixedTrainingPathId } : parsedParams;
  const dataPromise = config.fetchPage({ ...params, institutionId, scope });
  const selectedTrainingPathPromise =
    resource === AcademicResource.STUDY_PLAN && params.trainingPathId && !isTrainingPathFixed
      ? fetchTrainingPath(scope, institutionId, params.trainingPathId)
      : Promise.resolve(null);
  const [data, selectedTrainingPath] = await Promise.all([dataPromise, selectedTrainingPathPromise]);
  const rows = data.items.map(config.toRow).map((row) => {
    if (!isTrainingPathFixed || resource !== AcademicResource.STUDY_PLAN) return row;
    return { ...row, detailValues: row.detailValues.slice(1) };
  });
  const filters = config.filters(params);
  const yearFilters = config.yearFilters?.(params) ?? [];
  const dateFilters = config.dateFilters?.(params) ?? [];
  const hasFilters =
    params.search.length > 0 ||
    (!isTrainingPathFixed && params.trainingPathId !== undefined) ||
    filters.some((filter) => filter.value !== filter.defaultValue) ||
    yearFilters.some((filter) => filter.value !== filter.defaultValue) ||
    dateFilters.some((filter) => filter.value !== undefined) ||
    params.startDate !== undefined ||
    params.endDate !== undefined;

  return (
    <div className="flex h-full flex-col gap-4">
      <DataTableNavigationProvider>
        <AcademicTableFilters
          dateFilters={dateFilters}
          filters={filters}
          search={params.search}
          searchable={config.searchable !== false}
          searchPlaceholder={config.searchPlaceholder}
          size={params.size}
          trainingPathFilter={
            resource === AcademicResource.STUDY_PLAN && !isTrainingPathFixed
              ? {
                  institutionId,
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
          institutionId={institutionId}
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
        />
      </DataTableNavigationProvider>
    </div>
  );
}
