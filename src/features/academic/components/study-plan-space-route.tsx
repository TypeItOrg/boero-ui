import type { ReactElement } from "react";

import { notFound } from "next/navigation";

import { LibraryBigIcon } from "lucide-react";

import { AcademicAccessDenied, AcademicPageIcon, AcademicShell } from "@features/academic/components/academic-shell";
import { EditPlanSpace, EditPrerequisite, NewPlanSpace, NewPrerequisite } from "@features/academic/components/study-plan-route-forms";
import { StudyPlanSpaceDetail } from "@features/academic/components/study-plan-space-detail";
import { ACADEMIC_ROUTE_SEGMENT } from "@features/academic/constants/academic-route.constants";
import { fetchStudyPlanSpace } from "@features/academic/services/academic.service";
import type { AcademicLevel } from "@features/academic/types/academic-level.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { StudyPlanCurriculum } from "@features/academic/types/study-plan-curriculum.types";
import { type StudyPlanRouteProps } from "@features/academic/types/study-plan-route-props.types";
import { formatStudyPlanLabel } from "@features/academic/utils/study-plan-label.util";

export async function StudyPlanSpaceRoute({
  props,
  curriculum,
  planPath,
  canEditCurriculum,
  levels,
}: {
  props: StudyPlanRouteProps;
  curriculum: StudyPlanCurriculum;
  planPath: string;
  canEditCurriculum: boolean;
  levels: AcademicLevel[];
}): Promise<ReactElement> {
  if (props.nestedId === ACADEMIC_ROUTE_SEGMENT.NEW) {
    if (!canEditCurriculum) {
      return <AcademicAccessDenied breadcrumb={props.breadcrumb} />;
    }

    const breadcrumb = props.renderBreadcrumb({
      hiddenSegments: [ACADEMIC_ROUTE_SEGMENT.SPACES],
      segmentLabels: { [props.id]: formatStudyPlanLabel(curriculum.studyPlan) },
    });

    return (
      <NewPlanSpace
        breadcrumb={breadcrumb}
        id={props.id}
        institutionId={props.institutionId}
        levels={levels}
        planPath={planPath}
        scope={props.scope}
      />
    );
  }

  if (!props.nestedId) {
    notFound();
  }

  const space = await fetchStudyPlanSpace(props.scope, props.institutionId, props.nestedId);

  if (!space || space.studyPlanId !== props.id) {
    notFound();
  }

  const spacePath = `${planPath}/spaces/${space.id}`;

  const spaceBreadcrumbLabels = {
    [props.id]: formatStudyPlanLabel(curriculum.studyPlan),
    [space.id]: space.academicSpaceName,
  };

  const spaceBreadcrumb = props.renderBreadcrumb({
    hiddenSegments: [ACADEMIC_ROUTE_SEGMENT.SPACES],
    segmentLabels: spaceBreadcrumbLabels,
  });

  const editSpaceBreadcrumb = props.renderBreadcrumb({
    hiddenSegments: [ACADEMIC_ROUTE_SEGMENT.SPACES],
    segmentLabels: {
      ...spaceBreadcrumbLabels,
      [ACADEMIC_ROUTE_SEGMENT.EDIT]: "Editar espacio",
    },
  });

  if (!props.nestedAction) {
    return (
      <AcademicShell
        title={space.academicSpaceName}
        breadcrumb={spaceBreadcrumb}
        headerClassName="flex-row items-center justify-between"
        actionsClassName="self-stretch"
        actions={<AcademicPageIcon icon={LibraryBigIcon} />}
      >
        <StudyPlanSpaceDetail
          space={space}
          curriculum={curriculum}
          basePath={props.basePath}
          scope={props.scope}
          institutionId={props.institutionId}
          canEditCurriculum={canEditCurriculum}
        />
      </AcademicShell>
    );
  }

  if (!canEditCurriculum) {
    return <AcademicAccessDenied breadcrumb={props.breadcrumb} />;
  }

  if (props.nestedAction === ACADEMIC_ROUTE_SEGMENT.EDIT) {
    return (
      <EditPlanSpace
        breadcrumb={editSpaceBreadcrumb}
        id={props.id}
        institutionId={props.institutionId}
        levels={levels}
        planPath={planPath}
        scope={props.scope}
        space={space}
        spacePath={spacePath}
      />
    );
  }

  if (props.nestedAction === AcademicResource.PREREQUISITE) {
    const planSpaces = [...curriculum.levels.flatMap((level) => level.spaces), ...curriculum.unassignedSpaces];

    if (props.leaf === ACADEMIC_ROUTE_SEGMENT.NEW) {
      const breadcrumb = props.renderBreadcrumb({
        hiddenSegments: [ACADEMIC_ROUTE_SEGMENT.SPACES, AcademicResource.PREREQUISITE],
        segmentLabels: {
          ...spaceBreadcrumbLabels,
          [ACADEMIC_ROUTE_SEGMENT.NEW]: "Nueva correlatividad",
        },
      });

      return (
        <NewPrerequisite
          breadcrumb={breadcrumb}
          id={props.id}
          institutionId={props.institutionId}
          planSpaces={planSpaces}
          planPath={planPath}
          scope={props.scope}
          spaceId={space.id}
          spacePath={spacePath}
        />
      );
    }

    if (props.leaf && props.leafId === ACADEMIC_ROUTE_SEGMENT.EDIT) {
      const breadcrumb = props.renderBreadcrumb({
        hiddenSegments: [ACADEMIC_ROUTE_SEGMENT.SPACES, AcademicResource.PREREQUISITE, props.leaf],
        segmentLabels: {
          ...spaceBreadcrumbLabels,
          [ACADEMIC_ROUTE_SEGMENT.EDIT]: "Editar correlatividad",
        },
      });

      return await EditPrerequisite({
        breadcrumb,
        id: props.id,
        institutionId: props.institutionId,
        planPath,
        planSpaces,
        prerequisiteId: props.leaf,
        scope: props.scope,
        spaceId: space.id,
        spacePath,
      });
    }
  }

  notFound();
}
