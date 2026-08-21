import { notFound } from "next/navigation";
import { LibraryBigIcon } from "lucide-react";

import { AcademicPageIcon, AcademicShell } from "@features/academic/components/academic-shell";
import { AcademicAccessDenied } from "@features/academic/components/academic-shell";
import { StudyPlanSpaceDetail } from "@features/academic/components/study-plan-space-detail";
import {
  EditLevel,
  EditPlanSpace,
  EditPrerequisite,
  NewLevel,
  NewPlanSpace,
  NewPrerequisite,
} from "@features/academic/components/study-plan-route-forms";
import { ACADEMIC_ROUTE_SEGMENT } from "@features/academic/constants/academic-route.constants";
import { fetchStudyPlanCurriculum, fetchStudyPlanSpace } from "@features/academic/services/academic.service";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import type { AcademicBreadcrumbOptions } from "@features/academic/types/academic-breadcrumb-options.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type StudyPlanRouteProps = {
  access: AcademicAccess;
  action: string;
  basePath: string;
  breadcrumb: React.ReactNode;
  id: string;
  institutionId: string;
  leaf?: string;
  leafId?: string;
  nestedAction?: string;
  nestedId?: string;
  renderBreadcrumb: (options?: AcademicBreadcrumbOptions) => React.ReactNode;
  scope: AcademicScope;
};

export async function StudyPlanRoute(props: StudyPlanRouteProps): Promise<React.ReactElement> {
  const curriculum = await fetchStudyPlanCurriculum(props.scope, props.institutionId, props.id);
  if (!curriculum) notFound();
  const planPath = `${props.basePath}/${AcademicResource.STUDY_PLAN}/${props.id}`;
  const canEditCurriculum = props.access.studyPlanCurriculumUpdate && curriculum.studyPlan.status === "DRAFT";
  const levels = curriculum.levels.map(({ level }) => level);

  if (props.action === AcademicResource.ACADEMIC_LEVEL) {
    if (!canEditCurriculum) return <AcademicAccessDenied breadcrumb={props.breadcrumb} />;
    if (props.nestedId === ACADEMIC_ROUTE_SEGMENT.NEW) {
      const breadcrumb = props.renderBreadcrumb({
        hiddenSegments: [AcademicResource.ACADEMIC_LEVEL],
        segmentLabels: { [props.id]: curriculum.studyPlan.name },
      });
      return <NewLevel breadcrumb={breadcrumb} id={props.id} institutionId={props.institutionId} planPath={planPath} scope={props.scope} />;
    }
    if (props.nestedId && props.nestedAction === ACADEMIC_ROUTE_SEGMENT.EDIT) {
      const level = levels.find((item) => item.id === props.nestedId);
      if (!level) notFound();
      const breadcrumb = props.renderBreadcrumb({
        hiddenSegments: [AcademicResource.ACADEMIC_LEVEL, level.id],
        segmentLabels: {
          [props.id]: curriculum.studyPlan.name,
          [ACADEMIC_ROUTE_SEGMENT.EDIT]: `Editar ${level.name}`,
        },
      });
      return (
        <EditLevel breadcrumb={breadcrumb} id={props.id} institutionId={props.institutionId} level={level} planPath={planPath} scope={props.scope} />
      );
    }
  }

  if (props.action === ACADEMIC_ROUTE_SEGMENT.SPACES) {
    if (props.nestedId === ACADEMIC_ROUTE_SEGMENT.NEW) {
      if (!canEditCurriculum) return <AcademicAccessDenied breadcrumb={props.breadcrumb} />;
      const breadcrumb = props.renderBreadcrumb({
        hiddenSegments: [ACADEMIC_ROUTE_SEGMENT.SPACES],
        segmentLabels: { [props.id]: curriculum.studyPlan.name },
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
    if (!props.nestedId) notFound();
    const space = await fetchStudyPlanSpace(props.scope, props.institutionId, props.nestedId);
    if (!space || space.studyPlanId !== props.id) notFound();
    const spacePath = `${planPath}/spaces/${space.id}`;
    const spaceBreadcrumbLabels = {
      [props.id]: curriculum.studyPlan.name,
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
    if (!canEditCurriculum) return <AcademicAccessDenied breadcrumb={props.breadcrumb} />;
    if (props.nestedAction === ACADEMIC_ROUTE_SEGMENT.EDIT)
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
  }
  notFound();
}
