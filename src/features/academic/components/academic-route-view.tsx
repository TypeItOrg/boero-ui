import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { getQueryParamValue, parseUuidQueryParam } from "@common/utils/query-param.util";
import { AcademicCollectionView } from "@features/academic/components/academic-collection";
import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import { ACADEMIC_RESOURCE_ICONS } from "@features/academic/config/academic-resource-icons.config";
import { ACADEMIC_ROUTE_SEGMENT } from "@features/academic/constants/academic-route.constants";
import { ActiveAcademicStatusButton } from "@features/academic/components/active-academic-status-dialog";
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";
import { AcademicDetail } from "@features/academic/components/academic-detail";
import { AcademicOverview } from "@features/academic/components/academic-overview";
import { AcademicResourceForm } from "@features/academic/components/academic-resource-form";
import { AcademicAccessDenied, AcademicPageIcon, AcademicShell } from "@features/academic/components/academic-shell";
import { StudyPlanRoute } from "@features/academic/components/study-plan-route";
import { StudyPlanCurriculumView } from "@features/academic/components/study-plan-curriculum";
import { TrainingPathStudyPlans } from "@features/academic/components/training-path-study-plans";
import {
  fetchAcademicSpaceUsage,
  fetchStudyPlanCurriculum,
  fetchTrainingPath,
} from "@features/academic/services/academic.service";
import { canReadAcademic, type AcademicAccess } from "@features/academic/types/academic-access.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import { hasActiveAcademicStatus } from "@features/academic/utils/has-active-academic-status.util";
import { canEditAcademicResource } from "@features/academic/utils/academic-state.util";
import { parseAcademicCollectionResource } from "@features/academic/utils/parse-academic-collection-resource.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { getAcademicRouteBase } from "@features/academic/utils/academic-scope.util";
import { parsePaginationQuery } from "@common/utils/pagination-query.util";

type AcademicRouteViewProps = {
  access: AcademicAccess;
  institutionId: string;
  renderBreadcrumb: (options?: AcademicBreadcrumbOptions) => React.ReactNode;
  scope: AcademicScope;
  segments?: string[];
  searchParams: Record<string, string | string[] | undefined>;
};

export type AcademicBreadcrumbOptions = {
  hiddenSegments?: readonly string[];
  segmentHrefs?: Readonly<Record<string, string>>;
  segmentLabels?: Readonly<Record<string, string>>;
};

export async function AcademicRouteView({
  access,
  institutionId,
  renderBreadcrumb,
  scope,
  segments = [],
  searchParams,
}: AcademicRouteViewProps): Promise<React.ReactElement> {
  const basePath = getAcademicRouteBase(scope, institutionId);
  const breadcrumb = renderBreadcrumb();
  if (segments.length === 0) {
    if (!canReadAcademic(access)) notFound();
    return (
      <AcademicOverview
        access={access}
        basePath={basePath}
        breadcrumb={breadcrumb}
        institutionId={institutionId}
        scope={scope}
      />
    );
  }

  const [resourceSegment, id, action, nestedId, nestedAction, leaf, leafId] = segments;
  const collectionResource = parseAcademicCollectionResource(resourceSegment);
  if (collectionResource) {
    const config = ACADEMIC_COLLECTION_CONFIG[collectionResource];
    ensureReadAccess(access, collectionResource);
    if (!id) {
      const createAction = config.canCreate(access) ? (
        <Button asChild size="lg" className="w-full">
          <ReturnToLink href={`${basePath}/${collectionResource}/${ACADEMIC_ROUTE_SEGMENT.NEW}`}>
            <PlusIcon data-icon="inline-start" />
            {config.createLabel}
          </ReturnToLink>
        </Button>
      ) : undefined;
      return (
        <AcademicShell
          title={config.title}
          description={config.description}
          breadcrumb={breadcrumb}
          actions={createAction}
        >
          <AcademicCollectionView
            basePath={basePath}
            canCreate={config.canCreate(access)}
            canChangeStatus={config.canChangeStatus(access)}
            canDelete={config.canDelete(access)}
            canRestore={config.canRestore(access)}
            canUpdate={config.canUpdate(access)}
            institutionId={institutionId}
            resource={collectionResource}
            scope={scope}
            searchParams={searchParams}
          />
        </AcademicShell>
      );
    }
    if (id === ACADEMIC_ROUTE_SEGMENT.NEW)
      return await renderPrimaryForm({
        access,
        basePath,
        breadcrumb,
        institutionId,
        resource: collectionResource,
        scope,
        searchParams,
      });
    if (action === "status") notFound();
    const isPrimaryDetailAction = action === ACADEMIC_ROUTE_SEGMENT.EDIT;
    if (config.hasCurriculum && action && !isPrimaryDetailAction) {
      return StudyPlanRoute({
        access,
        action,
        basePath,
        breadcrumb,
        id,
        institutionId,
        leaf,
        leafId,
        nestedAction,
        nestedId,
        renderBreadcrumb,
        scope,
      });
    }
    if (collectionResource === AcademicResource.ACADEMIC_YEAR && !action) {
      notFound();
    }
    return renderPrimaryDetail({
      access,
      action,
      basePath,
      breadcrumb,
      id,
      institutionId,
      renderBreadcrumb,
      resource: collectionResource,
      scope,
      searchParams,
    });
  }
  notFound();
}

async function renderPrimaryForm(
  input: RouteInput & { resource: AcademicCollectionResource },
): Promise<React.ReactElement> {
  ensureCreateAccess(input.access, input.resource);
  const collectionPath = `${input.basePath}/${input.resource}`;
  const returnTo = getSafeReturnTo(input.searchParams.returnTo, collectionPath);
  const contextualTrainingPath = await getContextualTrainingPath(input);
  const config = ACADEMIC_COLLECTION_CONFIG[input.resource];
  return (
    <AcademicShell
      title={`Nuevo ${config.singular}`}
      breadcrumb={input.breadcrumb}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<AcademicPageIcon icon={config.createIcon} />}
    >
      <AcademicResourceForm
        scope={input.scope}
        institutionId={input.institutionId}
        initialValues={
          contextualTrainingPath
            ? { trainingPathId: contextualTrainingPath.id, trainingPathName: contextualTrainingPath.name }
            : undefined
        }
        parentId={contextualTrainingPath?.id}
        resource={input.resource}
        returnTo={returnTo}
        trainingPathLocked={contextualTrainingPath !== undefined}
      />
    </AcademicShell>
  );
}

async function renderPrimaryDetail(
  input: RouteInput & {
    resource: AcademicCollectionResource;
    id: string;
    action?: string;
    renderBreadcrumb: (options?: AcademicBreadcrumbOptions) => React.ReactNode;
  },
): Promise<React.ReactElement> {
  const config = ACADEMIC_COLLECTION_CONFIG[input.resource];
  const curriculumPromise =
    input.resource === AcademicResource.STUDY_PLAN && !input.action
      ? fetchStudyPlanCurriculum(input.scope, input.institutionId, input.id)
      : Promise.resolve(null);
  const itemPromise =
    input.resource === AcademicResource.STUDY_PLAN && !input.action
      ? Promise.resolve(null)
      : config.fetchDetail(input.scope, input.institutionId, input.id);
  const usagePagination =
    input.resource === AcademicResource.ACADEMIC_SPACE && !input.action && input.access.studyPlanRead
      ? parsePaginationQuery({
          page: input.searchParams.usagePage,
          size: input.searchParams.usageSize,
        })
      : null;
  const academicSpaceUsagePromise = usagePagination
    ? fetchAcademicSpaceUsage(input.scope, input.institutionId, input.id, {
        page: usagePagination.page,
        size: usagePagination.size,
      })
    : Promise.resolve(null);
  const [curriculum, fetchedItem, academicSpaceUsage] = await Promise.all([
    curriculumPromise,
    itemPromise,
    academicSpaceUsagePromise,
  ]);
  const item = curriculum?.studyPlan ?? fetchedItem;
  if (!item) notFound();
  const detailPath = `${input.basePath}/${input.resource}/${input.id}`;
  const collectionPath = `${input.basePath}/${input.resource}`;
  const returnTo = getSafeReturnTo(input.searchParams.returnTo, collectionPath);
  const isNoDetailResource = input.resource === AcademicResource.ACADEMIC_YEAR;
  const canEdit = config.canUpdate(input.access) && canEditAcademicResource(input.resource, item);
  const canEditCurriculum =
    input.access.studyPlanCurriculumUpdate && curriculum !== null && curriculum.studyPlan.status === "DRAFT";
  const currentResource = input.resource;
  const academicSpaceStatusBlocked =
    currentResource === AcademicResource.ACADEMIC_SPACE &&
    hasActiveAcademicStatus(item) &&
    item.active &&
    academicSpaceUsage?.summary.deactivationBlocked === true;
  let statusAction: React.ReactNode;
  if (
    config.canChangeStatus(input.access) &&
    isDetailStatusResource(currentResource) &&
    hasActiveAcademicStatus(item)
  ) {
    statusAction = (
      <ActiveAcademicStatusButton
        active={item.active}
        disabled={academicSpaceStatusBlocked}
        id={item.id}
        institutionId={input.institutionId}
        resource={currentResource}
        resourceLabel={config.getTitle(item)}
        returnTo={detailPath}
        scope={input.scope}
      />
    );
  }
  const relatedPlans =
    input.resource === AcademicResource.TRAINING_PATH && input.access.studyPlanRead
      ? await TrainingPathStudyPlans({
          access: input.access,
          basePath: input.basePath,
          institutionId: input.institutionId,
          scope: input.scope,
          searchParams: input.searchParams,
          trainingPath: item as TrainingPath,
        })
      : null;
  const breadcrumb = input.renderBreadcrumb({
    segmentHrefs: isNoDetailResource ? { [input.id]: collectionPath } : undefined,
    segmentLabels: { [input.id]: config.getTitle(item) },
  });
  if (input.action === ACADEMIC_ROUTE_SEGMENT.EDIT) {
    if (!config.canUpdate(input.access)) return <AcademicAccessDenied breadcrumb={breadcrumb} />;
    if (!canEdit) notFound();
    return (
      <AcademicShell
        title={`Editar ${config.singular}`}
        breadcrumb={breadcrumb}
        headerClassName="flex-row items-center justify-between"
        actionsClassName="self-stretch"
        actions={<AcademicPageIcon icon={config.createIcon} />}
      >
        <AcademicResourceForm
          canChangeStatus={config.canChangeStatus(input.access)}
          scope={input.scope}
          institutionId={input.institutionId}
          resource={input.resource}
          id={input.id}
          returnTo={returnTo}
          initialValues={{ ...item }}
        />
      </AcademicShell>
    );
  }
  if (input.action) notFound();
  return (
    <AcademicShell
      title={config.getTitle(item)}
      breadcrumb={breadcrumb}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<AcademicPageIcon icon={ACADEMIC_RESOURCE_ICONS[input.resource]} />}
    >
      <AcademicDetail
        basePath={input.basePath}
        canEdit={canEdit}
        academicSpaceUsage={academicSpaceUsage}
        item={item}
        resource={input.resource}
        statusAction={statusAction}
        returnTo={returnTo}
      />
      {curriculum ? (
        <StudyPlanCurriculumView
          curriculum={curriculum}
          basePath={input.basePath}
          canEditCurriculum={canEditCurriculum}
          institutionId={input.institutionId}
          scope={input.scope}
        />
      ) : null}
      {relatedPlans}
    </AcademicShell>
  );
}

function isDetailStatusResource(resource: AcademicCollectionResource): resource is ActiveAcademicStatusResource {
  return (
    resource === AcademicResource.ACADEMIC_SPACE ||
    resource === AcademicResource.INSTRUMENT ||
    resource === AcademicResource.TRAINING_PATH
  );
}

async function getContextualTrainingPath(
  input: RouteInput & { resource: AcademicCollectionResource },
): Promise<TrainingPath | undefined> {
  if (input.resource !== AcademicResource.STUDY_PLAN) return undefined;

  const rawTrainingPathId = getQueryParamValue(input.searchParams.trainingPathId);
  if (rawTrainingPathId === undefined) return undefined;

  const trainingPathId = parseUuidQueryParam(rawTrainingPathId);
  if (!trainingPathId) notFound();

  const trainingPath = await fetchTrainingPath(input.scope, input.institutionId, trainingPathId);
  if (!trainingPath) notFound();

  return trainingPath;
}

type RouteInput = {
  access: AcademicAccess;
  basePath: string;
  breadcrumb: React.ReactNode;
  institutionId: string;
  scope: AcademicScope;
  searchParams: Record<string, string | string[] | undefined>;
};

function ensureReadAccess(access: AcademicAccess, resource: AcademicCollectionResource): void {
  if (ACADEMIC_COLLECTION_CONFIG[resource].canRead(access)) return;
  notFound();
}

function ensureCreateAccess(access: AcademicAccess, resource: AcademicCollectionResource): void {
  if (!ACADEMIC_COLLECTION_CONFIG[resource].canCreate(access)) notFound();
}
