import { notFound } from "next/navigation";

import { parsePaginationQuery } from "@common/utils/pagination-query.util";
import type { FormValue } from "@common/types/form-value.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { AcademicDetail } from "@features/academic/components/academic-detail";
import { AcademicResourceForm } from "@features/academic/components/academic-resource-form";
import { AcademicAccessDenied, AcademicPageIcon, AcademicShell } from "@features/academic/components/academic-shell";
import { ActiveAcademicStatusButton } from "@features/academic/components/active-academic-status-dialog";
import { CourseDetailStatusActions } from "@features/academic/components/course-status-dialog";
import { StudyPlanCurriculumView } from "@features/academic/components/study-plan-curriculum";
import { TrainingPathStudyPlans } from "@features/academic/components/training-path-study-plans";
import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import { ACADEMIC_RESOURCE_ICONS } from "@features/academic/config/academic-resource-icons.config";
import { ACADEMIC_ROUTE_SEGMENT } from "@features/academic/constants/academic-route.constants";
import { fetchAcademicSpaceUsage, fetchStudyPlanCurriculum } from "@features/academic/services/academic.service";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import type { AcademicBreadcrumbOptions } from "@features/academic/types/academic-breadcrumb-options.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { canEditAcademicResource } from "@features/academic/utils/academic-state.util";
import { hasActiveAcademicStatus } from "@features/academic/utils/has-active-academic-status.util";

type RouteDetailInput = {
  access: AcademicAccess;
  action?: string;
  basePath: string;
  breadcrumb: React.ReactNode;
  id: string;
  institutionId: string;
  renderBreadcrumb: (options?: AcademicBreadcrumbOptions) => React.ReactNode;
  resource: AcademicCollectionResource;
  scope: AcademicScope;
  searchParams: Record<string, string | string[] | undefined>;
};

export async function renderPrimaryDetail(input: RouteDetailInput): Promise<React.ReactElement> {
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
  const [curriculum, fetchedItem, academicSpaceUsage] = await Promise.all([curriculumPromise, itemPromise, academicSpaceUsagePromise]);
  const item = curriculum?.studyPlan ?? fetchedItem;
  if (!item) notFound();
  const detailPath = `${input.basePath}/${input.resource}/${input.id}`;
  const collectionPath = `${input.basePath}/${input.resource}`;
  const returnTo = getSafeReturnTo(input.searchParams.returnTo, collectionPath);
  const isNoDetailResource = input.resource === AcademicResource.ACADEMIC_YEAR;
  const canEdit = config.canUpdate(input.access) && canEditAcademicResource(input.resource, item);
  const canEditCurriculum = input.access.studyPlanCurriculumUpdate && curriculum !== null && curriculum.studyPlan.status === "DRAFT";
  const currentResource = input.resource;
  const academicSpaceStatusBlocked =
    currentResource === AcademicResource.ACADEMIC_SPACE &&
    hasActiveAcademicStatus(item) &&
    item.active &&
    academicSpaceUsage?.summary.deactivationBlocked === true;
  let statusAction: React.ReactNode;
  if (currentResource === AcademicResource.COURSE) {
    const course = item as import("@features/academic/types/course.types").Course;
    const courseStatus = (course.status ??
      (course.active ? "ACTIVE" : "INACTIVE")) as import("@features/academic/types/course-status.types").CourseStatus;
    if (config.canChangeStatus(input.access) && courseStatus !== "CLOSED") {
      statusAction = (
        <CourseDetailStatusActions
          courseStatus={courseStatus}
          id={item.id}
          institutionId={input.institutionId}
          resourceLabel={config.getTitle(item)}
          returnTo={detailPath}
          scope={input.scope}
        />
      );
    }
  } else if (config.canChangeStatus(input.access) && isDetailStatusResource(currentResource) && hasActiveAcademicStatus(item)) {
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
          initialValues={{ ...item, classes: JSON.stringify("classes" in item ? item.classes : []) } as Record<string, FormValue>}
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
  return resource === AcademicResource.ACADEMIC_SPACE || resource === AcademicResource.INSTRUMENT || resource === AcademicResource.TRAINING_PATH;
}
