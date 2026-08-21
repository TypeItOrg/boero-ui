import Link from "next/link";
import { notFound } from "next/navigation";
import { BookPlusIcon, GitBranchPlusIcon, Layers3Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { AcademicDeleteButton } from "@features/academic/components/academic-delete-button";
import { AcademicResourceForm } from "@features/academic/components/academic-resource-form";
import { AcademicPageIcon, AcademicShell } from "@features/academic/components/academic-shell";
import { fetchPrerequisite } from "@features/academic/services/academic.service";
import type { AcademicFormOptions } from "@features/academic/types/academic-form-options.types";
import type { AcademicLevel } from "@features/academic/types/academic-level.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type BaseFormProps = {
  breadcrumb: React.ReactNode;
  id: string;
  institutionId: string;
  planPath: string;
  scope: AcademicScope;
};

export function NewLevel(props: BaseFormProps): React.ReactElement {
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

export function EditLevel(props: BaseFormProps & { level: AcademicLevel }): React.ReactElement {
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

export function NewPlanSpace(props: BaseFormProps & { levels: AcademicLevel[] }): React.ReactElement {
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

export function EditPlanSpace(props: BaseFormProps & { levels: AcademicLevel[]; space: StudyPlanSpace; spacePath: string }): React.ReactElement {
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

export function NewPrerequisite(
  props: BaseFormProps & {
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

export async function EditPrerequisite(
  props: BaseFormProps & {
    planSpaces: AcademicFormOptions["planSpaces"];
    prerequisiteId: string;
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
