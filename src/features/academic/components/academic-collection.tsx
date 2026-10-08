import type { ReactElement } from "react";

import { DataTableAdvancedFiltersTrigger } from "@common/components/ui/data-table-advanced-filters-trigger";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { Sheet } from "@common/components/ui/sheet";

import { AcademicCollectionFilters } from "@features/academic/components/academic-collection-filters";
import { AcademicTablePresentation } from "@features/academic/components/academic-table-presentation";
import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import { type AcademicCollectionProps } from "@features/academic/types/academic-collection-view-props.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { getAcademicCollectionFilters } from "@features/academic/utils/academic-collection-filter-state.util";
import { parseAcademicPaginationParams } from "@features/academic/utils/academic-pagination.util";
import { getAcademicTrainingPathId } from "@features/academic/utils/academic-training-path.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import type { InstitutionalPermission } from "@features/institutional-auth/types/institutional-permission.types";
import { scopeIncludesTrainingPath } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformCollectionActions } from "@features/platform-auth/components/platform-collection-actions";

export async function AcademicCollectionView({
  basePath,
  canCreate,
  canReadWaitlist = false,
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
}: AcademicCollectionProps): Promise<ReactElement> {
  const config = ACADEMIC_COLLECTION_CONFIG[resource];

  const isTrainingPathFixed = fixedTrainingPathId !== undefined;

  const parsedParams = parseAcademicPaginationParams(searchParams, resource);

  const params = isTrainingPathFixed ? { ...parsedParams, trainingPathId: fixedTrainingPathId } : parsedParams;

  const effectiveInstitutionId = global ? params.institutionId : institutionId;

  const data = await config.fetchPage({
    ...params,
    global,
    institutionId: effectiveInstitutionId,
    scope,
  });

  const selectedTrainingPath = data.items.find((item) => "trainingPathId" in item && item.trainingPathId === params.trainingPathId);

  const selectedStudyPlan = data.items.find((item) => "studyPlanId" in item && item.studyPlanId === params.studyPlanId);

  const selectedAcademicSpace = data.items.find((item) => "academicSpaceId" in item && item.academicSpaceId === params.academicSpaceId);

  const user = scope === "institutional" ? await requireInstitutionalUser() : null;

  const rows = data.items
    .map((item) => {
      const row = config.toRow(item);

      const permissionResource = getPermissionResource(resource);

      if (!user || !permissionResource) {
        return row;
      }

      const pathId = getAcademicTrainingPathId(resource, item) ?? "";

      const permits = (action: string) =>
        scopeIncludesTrainingPath(user.permissionScopes, `institution:${permissionResource}:${action}` as InstitutionalPermission, pathId);

      return {
        ...row,
        scopedActions: {
          update: permits("update"),
          delete: permits("delete"),
          restore: permits("restore"),
          status: permits("update-status"),
          createVersion: permits("create"),
          waitlist: scopeIncludesTrainingPath(user.permissionScopes, "institution:course-waitlist:read" as InstitutionalPermission, pathId),
        },
      };
    })
    .map((row) => {
      if (!isTrainingPathFixed || resource !== AcademicResource.STUDY_PLAN) {
        return row;
      }

      return { ...row, detailValues: row.detailValues.slice(1) };
    });

  const filterState = getAcademicCollectionFilters({
    config,
    params,
    resource,
    isTrainingPathFixed,
  });

  const actionAlignment = filterState.useAdvancedFilters ? "sm:justify-between" : "sm:justify-start";

  return (
    <div className="flex h-full flex-col gap-4">
      <DataTableNavigationProvider>
        <Sheet>
          <PlatformCollectionActions className={createAction ? actionAlignment : undefined}>
            {filterState.useAdvancedFilters ? (
              <>
                {createAction}
                <DataTableAdvancedFiltersTrigger count={filterState.advancedBadgeCount} label="Filtros avanzados" />
              </>
            ) : (
              createAction
            )}
          </PlatformCollectionActions>
          <AcademicCollectionFilters
            {...filterState}
            scope={scope}
            effectiveInstitutionId={effectiveInstitutionId}
            selectedAcademicSpace={selectedAcademicSpace}
            params={params}
            global={global}
            institutionName={institutionName}
            config={config}
            selectedStudyPlan={selectedStudyPlan}
            isTrainingPathFixed={isTrainingPathFixed}
            selectedTrainingPath={selectedTrainingPath}
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
            canReadWaitlist={canReadWaitlist}
            deleted={params.deleted}
            page={params.page}
            resource={resource}
            hasFilters={filterState.hasFilters}
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

function getPermissionResource(resource: AcademicResource): string | null {
  switch (resource) {
    case AcademicResource.TRAINING_PATH:
      return "training-path";
    case AcademicResource.STUDY_PLAN:
      return "study-plan";
    case AcademicResource.COURSE:
      return "course";
    default:
      return null;
  }
}
