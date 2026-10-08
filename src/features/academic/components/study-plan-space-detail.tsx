import type { ReactElement } from "react";

import Link from "next/link";

import { GitBranchPlusIcon, LibraryBigIcon, PlusIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Button } from "@common/components/ui/button";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";

import { AcademicDeleteButton } from "@features/academic/components/academic-delete-button";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { Prerequisite } from "@features/academic/types/prerequisite.types";
import type { StudyPlanCurriculum } from "@features/academic/types/study-plan-curriculum.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import {
  approvalModeLabels,
  requiredConditionLabels,
  requirementStageLabels,
  requirementTypeLabels,
} from "@features/academic/utils/academic-labels.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type StudyPlanSpaceDetailProps = {
  space: StudyPlanSpace;
  curriculum: StudyPlanCurriculum;
  prerequisite?: Prerequisite;
  basePath: string;
  scope: AcademicScope;
  institutionId: string;
  canEditCurriculum: boolean;
};

export function StudyPlanSpaceDetail({
  space,
  curriculum,
  prerequisite,
  basePath,
  scope,
  institutionId,
  canEditCurriculum,
}: StudyPlanSpaceDetailProps): ReactElement {
  const planPath = `${basePath}/study-plans/${space.studyPlanId}`;
  const prerequisites = prerequisite ? [prerequisite] : curriculum.prerequisites.filter((item) => item.targetStudyPlanSpaceId === space.id);
  const names = new Map(
    [...curriculum.levels.flatMap((level) => level.spaces), ...curriculum.unassignedSpaces].map((item) => [item.id, item.academicSpaceName]),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild size="lg" variant="outline">
          <Link href={planPath}>Volver</Link>
        </Button>
        {canEditCurriculum ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href={`${planPath}/spaces/${space.id}/edit`}>Editar</Link>
            </Button>
            <AcademicDeleteButton
              scope={scope}
              institutionId={institutionId}
              resource={AcademicResource.STUDY_PLAN_SPACE}
              id={space.id}
              destination={planPath}
              label="el espacio del plan"
            />
          </div>
        ) : null}
      </div>

      <section aria-labelledby="study-plan-space-configuration-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <SectionHeader
            icon={LibraryBigIcon}
            title="Configuración curricular"
            description="Consultá la ubicación y las condiciones académicas de este espacio dentro del plan."
            titleId="study-plan-space-configuration-title"
          />
        </header>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CurriculumDetailValue label="Carácter" value={requirementTypeLabels[space.requirementType]} />
          <CurriculumDetailValue label="Nivel" value={space.academicLevelName ?? "Sin nivel asignado"} />
          <CurriculumDetailValue label="Aprobación" value={approvalModeLabels[space.approvalMode]} />
          <CurriculumDetailValue label="Orden" value={String(space.displayOrder)} />
        </dl>
      </section>

      <section aria-labelledby="study-plan-space-prerequisites-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <SectionHeader
            icon={GitBranchPlusIcon}
            title="Correlatividades"
            description="Condiciones que deben cumplirse para cursar o aprobar."
            titleId="study-plan-space-prerequisites-title"
            action={
              canEditCurriculum ? (
                <Button asChild size="lg">
                  <Link href={`${planPath}/spaces/${space.id}/prerequisites/new`}>
                    <PlusIcon data-icon="inline-start" />
                    Nueva correlatividad
                  </Link>
                </Button>
              ) : null
            }
          />
        </header>
        <div className="mt-5 flex flex-col gap-2">
          {prerequisites.length === 0 ? (
            <div className="bg-background rounded-xl border p-5">
              <p className="text-muted-foreground text-sm">Este espacio no tiene correlatividades configuradas.</p>
            </div>
          ) : (
            prerequisites.map((item) => (
              <Link
                key={item.id}
                href={`${planPath}/spaces/${space.id}/prerequisites/${item.id}/edit`}
                className="hover:bg-muted/40 bg-background flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <span className="font-medium">{names.get(item.requiredStudyPlanSpaceId) ?? "Espacio requerido"}</span>
                <span className="text-muted-foreground text-sm">
                  {requirementStageLabels[item.requirementStage]} · {requiredConditionLabels[item.requiredCondition]}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function CurriculumDetailValue({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="bg-background rounded-lg border p-4">
      <dt className={DETAIL_LABEL_CLASS_NAME}>{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
