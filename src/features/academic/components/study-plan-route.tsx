import type { ReactElement } from "react";

import { notFound } from "next/navigation";

import { GitBranchPlusIcon } from "lucide-react";

import { getSafeReturnTo } from "@common/utils/return-to.util";

import { AcademicAccessDenied, AcademicPageIcon, AcademicShell } from "@features/academic/components/academic-shell";
import { EditLevel, NewLevel } from "@features/academic/components/study-plan-route-forms";
import { StudyPlanSpaceRoute } from "@features/academic/components/study-plan-space-route";
import { StudyPlanVersionForm } from "@features/academic/components/study-plan-version-form";
import { ACADEMIC_ROUTE_SEGMENT } from "@features/academic/constants/academic-route.constants";
import { fetchStudyPlanCurriculum } from "@features/academic/services/academic.service";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { type StudyPlanRouteProps } from "@features/academic/types/study-plan-route-props.types";
import { getAcademicAccess } from "@features/academic/utils/academic-access.util";
import { formatStudyPlanLabel } from "@features/academic/utils/study-plan-label.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";

export async function StudyPlanRoute(props: StudyPlanRouteProps): Promise<ReactElement> {
  const curriculum = await fetchStudyPlanCurriculum(props.scope, props.institutionId, props.id);

  if (!curriculum) {
    notFound();
  }

  const access =
    props.scope === "institutional" ? getAcademicAccess(await requireInstitutionalUser(), curriculum.studyPlan.trainingPathId) : props.access;

  const planPath = `${props.basePath}/${AcademicResource.STUDY_PLAN}/${props.id}`;

  const canEditCurriculum = access.studyPlanCurriculumUpdate && curriculum.studyPlan.status === "DRAFT";

  const levels = curriculum.levels.map(({ level }) => level);

  if (props.action === ACADEMIC_ROUTE_SEGMENT.VERSIONS) {
    if (props.nestedId !== ACADEMIC_ROUTE_SEGMENT.NEW) {
      notFound();
    }

    if (!access.studyPlanCreate || curriculum.studyPlan.status === "DRAFT") {
      return <AcademicAccessDenied breadcrumb={props.breadcrumb} />;
    }

    const breadcrumb = props.renderBreadcrumb({
      hiddenSegments: [ACADEMIC_ROUTE_SEGMENT.VERSIONS],
      segmentLabels: {
        [props.id]: formatStudyPlanLabel(curriculum.studyPlan),
        [ACADEMIC_ROUTE_SEGMENT.NEW]: "Nueva versión",
      },
    });

    const returnTo = getSafeReturnTo(props.searchParams?.returnTo, planPath);

    return (
      <AcademicShell
        title="Nueva versión"
        breadcrumb={breadcrumb}
        minViewportHeight
        headerClassName="flex-row items-center justify-between"
        actionsClassName="self-stretch"
        actions={<AcademicPageIcon icon={GitBranchPlusIcon} />}
      >
        <StudyPlanVersionForm institutionId={props.institutionId} returnTo={returnTo} scope={props.scope} source={curriculum.studyPlan} />
      </AcademicShell>
    );
  }

  if (props.action === AcademicResource.ACADEMIC_LEVEL) {
    if (!canEditCurriculum) {
      return <AcademicAccessDenied breadcrumb={props.breadcrumb} />;
    }

    if (props.nestedId === ACADEMIC_ROUTE_SEGMENT.NEW) {
      const breadcrumb = props.renderBreadcrumb({
        hiddenSegments: [AcademicResource.ACADEMIC_LEVEL],
        segmentLabels: { [props.id]: formatStudyPlanLabel(curriculum.studyPlan) },
      });

      return <NewLevel breadcrumb={breadcrumb} id={props.id} institutionId={props.institutionId} planPath={planPath} scope={props.scope} />;
    }

    if (props.nestedId && props.nestedAction === ACADEMIC_ROUTE_SEGMENT.EDIT) {
      const level = levels.find((item) => item.id === props.nestedId);

      if (!level) {
        notFound();
      }

      const breadcrumb = props.renderBreadcrumb({
        hiddenSegments: [AcademicResource.ACADEMIC_LEVEL, level.id],
        segmentLabels: {
          [props.id]: formatStudyPlanLabel(curriculum.studyPlan),
          [ACADEMIC_ROUTE_SEGMENT.EDIT]: `Editar ${level.name}`,
        },
      });

      return (
        <EditLevel breadcrumb={breadcrumb} id={props.id} institutionId={props.institutionId} level={level} planPath={planPath} scope={props.scope} />
      );
    }
  }

  if (props.action === ACADEMIC_ROUTE_SEGMENT.SPACES) {
    return StudyPlanSpaceRoute({ props, curriculum, planPath, canEditCurriculum, levels });
  }

  notFound();
}
