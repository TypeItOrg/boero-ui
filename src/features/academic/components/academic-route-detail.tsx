import type { ReactElement } from "react";

import { notFound } from "next/navigation";

import { GitBranchPlusIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import type { FormValue } from "@common/types/form-value.types";
import { parsePaginationQuery } from "@common/utils/pagination-query.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import { AcademicDetail } from "@features/academic/components/academic-detail";
import { getAcademicDetailStatusAction } from "@features/academic/components/academic-detail-status-action";
import { AcademicResourceForm } from "@features/academic/components/academic-resource-form";
import { AcademicAccessDenied, AcademicPageIcon, AcademicShell } from "@features/academic/components/academic-shell";
import { StudyPlanCurriculumView } from "@features/academic/components/study-plan-curriculum";
import { TrainingPathDocuments } from "@features/academic/components/training-path-documents";
import { TrainingPathStudyPlans } from "@features/academic/components/training-path-study-plans";
import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import { ACADEMIC_RESOURCE_ICONS } from "@features/academic/config/academic-resource-icons.config";
import { ACADEMIC_ROUTE_SEGMENT } from "@features/academic/constants/academic-route.constants";
import { fetchAcademicDetailDocumentRequirements } from "@features/academic/services/academic-detail-documents.service";
import { fetchAcademicSpaceUsage, fetchStudyPlanCurriculum } from "@features/academic/services/academic.service";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { type RouteDetailInput } from "@features/academic/types/academic-route-detail-input.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import { getAcademicAccess } from "@features/academic/utils/academic-access.util";
import { canEditAcademicResource } from "@features/academic/utils/academic-state.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";

export async function renderPrimaryDetail(input: RouteDetailInput): Promise<ReactElement> {
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

  if (!item) {
    notFound();
  }

  if (input.scope === "institutional") {
    const pathId = input.resource === AcademicResource.TRAINING_PATH ? item.id : "trainingPathId" in item ? String(item.trainingPathId) : undefined;

    if (pathId) {
      input = { ...input, access: getAcademicAccess(await requireInstitutionalUser(), pathId) };
    }
  }

  const detailPath = `${input.basePath}/${input.resource}/${input.id}`;
  const collectionPath = `${input.basePath}/${input.resource}`;
  const returnTo = getSafeReturnTo(input.searchParams.returnTo, collectionPath);
  const versionReturnTo = getSafeReturnTo(input.searchParams.returnTo, detailPath);
  const isNoDetailResource = input.resource === AcademicResource.ACADEMIC_YEAR;
  const canEdit = config.canUpdate(input.access) && canEditAcademicResource(input.resource, item);
  const canEditCurriculum = input.access.studyPlanCurriculumUpdate && curriculum !== null && curriculum.studyPlan.status === "DRAFT";

  const canCreateVersion =
    input.resource === AcademicResource.STUDY_PLAN &&
    input.access.studyPlanCreate &&
    (item as StudyPlan).status !== "DRAFT" &&
    item.deletedAt == null;

  const statusAction = getAcademicDetailStatusAction({
    input,
    config,
    item,
    detailPath,
    deactivationBlocked: academicSpaceUsage?.summary.deactivationBlocked === true,
  });

  const documentRequirements = await fetchAcademicDetailDocumentRequirements(input);

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

  const versionAction = canCreateVersion ? (
    <Button asChild size="lg" variant="outline">
      <ReturnToLink href={`${detailPath}/versions/new`} returnTo={versionReturnTo}>
        <GitBranchPlusIcon data-icon="inline-start" />
        Nueva versión
      </ReturnToLink>
    </Button>
  ) : null;

  if (input.action === ACADEMIC_ROUTE_SEGMENT.EDIT) {
    if (!config.canUpdate(input.access)) {
      return <AcademicAccessDenied breadcrumb={breadcrumb} />;
    }

    if (!canEdit) {
      notFound();
    }

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
          documentRequirements={documentRequirements}
          canManageDocumentCatalog={input.access.documentCatalogManage}
          canEditDocumentRequirements={canEdit}
        />
      </AcademicShell>
    );
  }

  if (input.action) {
    notFound();
  }

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
        versionAction={versionAction}
        returnTo={returnTo}
      />
      {input.resource === AcademicResource.TRAINING_PATH ? <TrainingPathDocuments requirements={documentRequirements} /> : null}
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
