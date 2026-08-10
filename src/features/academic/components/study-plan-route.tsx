import { notFound } from "next/navigation";
import { BookPlusIcon, GitBranchPlusIcon, Layers3Icon } from "lucide-react";

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
      return <NewPlanSpace {...props} levels={levels} planPath={planPath} />;
    }
    if (!props.nestedId) notFound();
    const space = await fetchStudyPlanSpace(props.scope, props.institutionId, props.nestedId);
    if (!space || space.studyPlanId !== props.id) notFound();
    const spacePath = `${planPath}/spaces/${space.id}`;

    if (!props.nestedAction) {
      return (
        <AcademicShell
          title={space.academicSpaceName}
          description="Detalle del espacio dentro del plan."
          breadcrumb={props.breadcrumb}
          backHref={planPath}
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
      return <EditPlanSpace {...props} levels={levels} space={space} spacePath={spacePath} />;
    if (props.nestedAction === AcademicResource.PREREQUISITE) {
      const planSpaces = [...curriculum.levels.flatMap((level) => level.spaces), ...curriculum.unassignedSpaces];
      if (props.leaf === ACADEMIC_ROUTE_SEGMENT.NEW)
        return <NewPrerequisite {...props} planSpaces={planSpaces} spaceId={space.id} spacePath={spacePath} />;
      if (props.leaf && props.leafId === ACADEMIC_ROUTE_SEGMENT.EDIT)
        return (
          <EditPrerequisite
            {...props}
            prerequisiteId={props.leaf}
            planSpaces={planSpaces}
            spaceId={space.id}
            spacePath={spacePath}
          />
        );
    }
  }
  notFound();
}

function NewLevel(props: StudyPlanRouteProps & { planPath: string }): React.ReactElement {
  return (
    <AcademicShell
      title="Nuevo nivel"
      description="Agregá un nivel ordenado a la currícula."
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
      description="Actualizá el orden y la descripción del nivel."
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
      description="Ubicá un espacio del catálogo dentro de la currícula."
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
      description="Actualizá su ubicación y reglas curriculares."
      breadcrumb={props.breadcrumb}
      backHref={props.spacePath}
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
      description="Definí qué espacio debe regularizarse o aprobarse."
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
      description="Actualizá la condición académica requerida."
      breadcrumb={props.breadcrumb}
      backHref={props.spacePath}
    >
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
      <DeleteFooter
        scope={props.scope}
        institutionId={props.institutionId}
        resource={AcademicResource.PREREQUISITE}
        id={prerequisite.id}
        destination={props.spacePath}
        label="la correlatividad"
      />
    </AcademicShell>
  );
}

function DeleteFooter(props: React.ComponentProps<typeof AcademicDeleteButton>): React.ReactElement {
  return (
    <div className="mx-auto mt-5 flex w-full max-w-3xl justify-end">
      <AcademicDeleteButton {...props} />
    </div>
  );
}
