import Link from "next/link";
import { notFound } from "next/navigation";
import { BookPlusIcon, GitBranchPlusIcon, Layers3Icon, LibraryBigIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { StudyPlanSpaceDetail } from "@features/academic/components/academic-detail";
import { AcademicDeleteButton } from "@features/academic/components/academic-delete-button";
import { AcademicResourceForm } from "@features/academic/components/academic-resource-form";
import type { AcademicBreadcrumbOptions } from "@features/academic/components/academic-route-view";
import { AcademicAccessDenied, AcademicPageIcon, AcademicShell } from "@features/academic/components/academic-shell";
import { ACADEMIC_ROUTE_SEGMENT } from "@features/academic/constants/academic-route.constants";
import {
  fetchPrerequisite,
  fetchStudyPlanCurriculum,
  fetchStudyPlanSpace,
} from "@features/academic/services/academic.service";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import type { AcademicFormOptions } from "@features/academic/types/academic-form-options.types";
import type { AcademicLevel } from "@features/academic/types/academic-level.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
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
      return <NewLevel {...props} breadcrumb={breadcrumb} planPath={planPath} />;
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
      return <EditLevel {...props} breadcrumb={breadcrumb} level={level} planPath={planPath} />;
    }
  }

  if (props.action === ACADEMIC_ROUTE_SEGMENT.SPACES) {
    if (props.nestedId === ACADEMIC_ROUTE_SEGMENT.NEW) {
      if (!canEditCurriculum) return <AcademicAccessDenied breadcrumb={props.breadcrumb} />;
      const breadcrumb = props.renderBreadcrumb({
        hiddenSegments: [ACADEMIC_ROUTE_SEGMENT.SPACES],
        segmentLabels: { [props.id]: curriculum.studyPlan.name },
      });
      return <NewPlanSpace {...props} breadcrumb={breadcrumb} levels={levels} planPath={planPath} />;
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
          {...props}
          breadcrumb={editSpaceBreadcrumb}
          levels={levels}
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
            {...props}
            breadcrumb={breadcrumb}
            planSpaces={planSpaces}
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
        return (
          <EditPrerequisite
            {...props}
            breadcrumb={breadcrumb}
            prerequisiteId={props.leaf}
            planSpaces={planSpaces}
            spaceId={space.id}
            spacePath={spacePath}
          />
        );
      }
    }
  }
  notFound();
}

function NewLevel(props: StudyPlanRouteProps & { planPath: string }): React.ReactElement {
  return (
    <AcademicShell
      title="Nuevo nivel"
      breadcrumb={props.breadcrumb}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<AcademicPageIcon icon={Layers3Icon} />}
    >
      <AcademicResourceForm
        scope={props.scope}
        institutionId={props.institutionId}
        resource={AcademicResource.ACADEMIC_LEVEL}
        parentId={props.id}
        returnTo={props.planPath}
      />
    </AcademicShell>
  );
}

function EditLevel(props: StudyPlanRouteProps & { level: AcademicLevel; planPath: string }): React.ReactElement {
  return (
    <AcademicShell
      title="Editar nivel"
      breadcrumb={props.breadcrumb}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<AcademicPageIcon icon={Layers3Icon} />}
    >
      <AcademicResourceForm
        scope={props.scope}
        institutionId={props.institutionId}
        resource={AcademicResource.ACADEMIC_LEVEL}
        id={props.level.id}
        parentId={props.id}
        returnTo={props.planPath}
        initialValues={{ ...props.level }}
      />
    </AcademicShell>
  );
}

function NewPlanSpace(props: StudyPlanRouteProps & { levels: AcademicLevel[]; planPath: string }): React.ReactElement {
  return (
    <AcademicShell
      title="Incorporar espacio"
      breadcrumb={props.breadcrumb}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<AcademicPageIcon icon={BookPlusIcon} />}
    >
      <AcademicResourceForm
        scope={props.scope}
        institutionId={props.institutionId}
        resource={AcademicResource.STUDY_PLAN_SPACE}
        parentId={props.id}
        returnTo={props.planPath}
        levels={props.levels}
      />
    </AcademicShell>
  );
}

function EditPlanSpace(
  props: StudyPlanRouteProps & { levels: AcademicLevel[]; space: StudyPlanSpace; spacePath: string },
): React.ReactElement {
  return (
    <AcademicShell
      title="Editar espacio"
      breadcrumb={props.breadcrumb}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<AcademicPageIcon icon={BookPlusIcon} />}
    >
      <AcademicResourceForm
        scope={props.scope}
        institutionId={props.institutionId}
        resource={AcademicResource.STUDY_PLAN_SPACE}
        id={props.space.id}
        parentId={props.id}
        returnTo={props.spacePath}
        initialValues={{ ...props.space }}
        levels={props.levels}
      />
    </AcademicShell>
  );
}

function NewPrerequisite(
  props: StudyPlanRouteProps & {
    planSpaces: AcademicFormOptions["planSpaces"];
    spaceId: string;
    spacePath: string;
  },
): React.ReactElement {
  return (
    <AcademicShell
      title="Nueva correlatividad"
      breadcrumb={props.breadcrumb}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<AcademicPageIcon icon={GitBranchPlusIcon} />}
    >
      <AcademicResourceForm
        scope={props.scope}
        institutionId={props.institutionId}
        resource={AcademicResource.PREREQUISITE}
        parentId={props.spaceId}
        returnTo={props.spacePath}
        planSpaces={props.planSpaces}
        excludedPlanSpaceId={props.spaceId}
      />
    </AcademicShell>
  );
}

async function EditPrerequisite(
  props: StudyPlanRouteProps & {
    prerequisiteId: string;
    planSpaces: AcademicFormOptions["planSpaces"];
    spaceId: string;
    spacePath: string;
  },
): Promise<React.ReactElement> {
  const prerequisite = await fetchPrerequisite(props.scope, props.institutionId, props.prerequisiteId);
  if (!prerequisite || prerequisite.targetStudyPlanSpaceId !== props.spaceId) notFound();
  return (
    <AcademicShell
      title="Editar correlatividad"
      breadcrumb={props.breadcrumb}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<AcademicPageIcon icon={GitBranchPlusIcon} />}
    >
      <div className="flex items-center justify-between gap-3">
        <Button asChild size="lg" variant="outline">
          <Link href={props.spacePath}>Volver</Link>
        </Button>
        <AcademicDeleteButton
          scope={props.scope}
          institutionId={props.institutionId}
          resource={AcademicResource.PREREQUISITE}
          id={prerequisite.id}
          destination={props.spacePath}
          label="la correlatividad"
          size="lg"
        />
      </div>
      <AcademicResourceForm
        scope={props.scope}
        institutionId={props.institutionId}
        resource={AcademicResource.PREREQUISITE}
        id={prerequisite.id}
        parentId={props.spaceId}
        returnTo={props.spacePath}
        initialValues={{ ...prerequisite }}
        planSpaces={props.planSpaces}
        excludedPlanSpaceId={props.spaceId}
      />
    </AcademicShell>
  );
}
