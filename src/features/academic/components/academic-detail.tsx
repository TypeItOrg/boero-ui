import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { formatDisplayDate } from "@common/utils/date-input.util";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { AcademicDeleteButton } from "@features/academic/components/academic-delete-button";
import { AcademicSpaceUsage, AcademicSpaceUsageWarning } from "@features/academic/components/academic-space-usage";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import type { AcademicSpace } from "@features/academic/types/academic-space.types";
import type { AcademicSpaceUsage as AcademicSpaceUsageData } from "@features/academic/types/academic-space-usage.types";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { Prerequisite } from "@features/academic/types/prerequisite.types";
import type { StudyPlanCurriculum } from "@features/academic/types/study-plan-curriculum.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import { hasActiveAcademicStatus } from "@features/academic/utils/has-active-academic-status.util";
import {
  academicSpaceTypeLabels,
  academicYearStatusLabels,
  approvalModeLabels,
  requiredConditionLabels,
  requirementStageLabels,
  requirementTypeLabels,
  studyPlanStatusLabels,
} from "@features/academic/utils/academic-labels.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

import { BookOpenCheckIcon, GitBranchPlusIcon, InfoIcon, LibraryBigIcon, PlusIcon } from "lucide-react";

import { cn } from "@common/utils/cn.util";

type AcademicDetailProps = {
  item: AcademicCollection;
  resource: AcademicCollectionResource;
  basePath: string;
  canEdit: boolean;
  academicSpaceUsage?: AcademicSpaceUsageData | null;
  statusAction?: ReactNode;
  returnTo?: string;
};

export function AcademicDetail({
  item,
  resource,
  basePath,
  canEdit,
  academicSpaceUsage,
  statusAction,
  returnTo,
}: AcademicDetailProps): React.ReactElement {
  const destination = returnTo ?? `${basePath}/${resource}`;
  const detailPath = `${basePath}/${resource}/${item.id}`;

  const headerActions = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button asChild size="lg" variant="outline">
        <Link href={destination}>Volver</Link>
      </Button>
      {canEdit || statusAction ? (
        <div className="flex flex-wrap items-center gap-2">
          {canEdit ? (
            <Button asChild size="lg">
              <ReturnToLink href={`${detailPath}/edit`}>Editar</ReturnToLink>
            </Button>
          ) : null}
          {statusAction}
        </div>
      ) : null}
    </div>
  );

  if (resource === AcademicResource.STUDY_PLAN) {
    return (
      <div className="flex flex-col gap-4">
        {headerActions}
        <StudyPlanSummary plan={item as StudyPlan} />
      </div>
    );
  }

  const detail = getDetail(resource, item);
  const academicSpaceWarning =
    resource === AcademicResource.ACADEMIC_SPACE && academicSpaceUsage?.summary.deactivationBlocked ? (
      <AcademicSpaceUsageWarning
        blockingPlanCount={academicSpaceUsage.summary.activePlans + academicSpaceUsage.summary.draftPlans}
      />
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      {headerActions}
      {academicSpaceWarning}
      <section aria-labelledby="academic-detail-info-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="border-b pb-5">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
              <InfoIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="academic-detail-info-title" className="text-base font-semibold">
                Información
              </h2>
              <p className="text-muted-foreground text-sm">{detail.description}</p>
            </div>
          </div>
        </header>
        <div className={cn("mt-5 grid gap-4", detail.gridColsClass ?? "sm:grid-cols-2")}>
          {detail.fields.map((field) => (
            <div key={field.label} className={cn("bg-background rounded-lg border p-4", field.className)}>
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{field.label}</p>
              <div className="mt-1 font-medium">{field.value}</div>
            </div>
          ))}
        </div>
      </section>
      {resource === AcademicResource.ACADEMIC_SPACE && academicSpaceUsage ? (
        <AcademicSpaceUsage basePath={basePath} usage={academicSpaceUsage} />
      ) : null}
    </div>
  );
}

function StudyPlanSummary({ plan }: { plan: StudyPlan }): React.ReactElement {
  return (
    <section aria-labelledby="study-plan-summary-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
            <BookOpenCheckIcon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="study-plan-summary-title" className="text-base font-semibold">
              Resumen
            </h2>
            <p className="text-muted-foreground text-sm">
              Consultá el trayecto formativo, el estado y el período de vigencia del plan.
            </p>
          </div>
        </div>
      </header>

      <dl className="grid gap-5 pt-5 sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground text-sm">Trayecto formativo</dt>
          <dd className="mt-1 font-semibold">{plan.trainingPathName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Estado</dt>
          <dd className="mt-1">
            <Badge variant={plan.status === "ACTIVE" ? "success" : "secondary"}>
              {studyPlanStatusLabels[plan.status]}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Vigencia</dt>
          <dd className="mt-1 font-semibold tabular-nums">{formatStudyPlanValidity(plan)}</dd>
        </div>
      </dl>
    </section>
  );
}

function formatStudyPlanValidity({
  effectiveFrom,
  effectiveTo,
}: Pick<StudyPlan, "effectiveFrom" | "effectiveTo">): string {
  if (!effectiveFrom && !effectiveTo) return "Sin período definido";

  if (effectiveFrom && !effectiveTo) return `Desde ${formatDisplayDate(effectiveFrom)}`;

  if (!effectiveFrom && effectiveTo) return `Hasta ${formatDisplayDate(effectiveTo)}`;

  return `${formatDisplayDate(effectiveFrom)} — ${formatDisplayDate(effectiveTo)}`;
}

export function StudyPlanSpaceDetail({
  space,
  curriculum,
  prerequisite,
  basePath,
  scope,
  institutionId,
  canEditCurriculum,
}: {
  space: StudyPlanSpace;
  curriculum: StudyPlanCurriculum;
  prerequisite?: Prerequisite;
  basePath: string;
  scope: AcademicScope;
  institutionId: string;
  canEditCurriculum: boolean;
}): React.ReactElement {
  const planPath = `${basePath}/study-plans/${space.studyPlanId}`;
  const prerequisites = prerequisite
    ? [prerequisite]
    : curriculum.prerequisites.filter((item) => item.targetStudyPlanSpaceId === space.id);
  const names = new Map(
    [...curriculum.levels.flatMap((level) => level.spaces), ...curriculum.unassignedSpaces].map((item) => [
      item.id,
      item.academicSpaceName,
    ]),
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

      <section
        aria-labelledby="study-plan-space-configuration-title"
        className="bg-muted/25 rounded-xl border p-5 md:p-6"
      >
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <LibraryBigIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="study-plan-space-configuration-title" className="text-base font-semibold">
                Configuración curricular
              </h2>
              <p className="text-muted-foreground text-sm">
                Consultá la ubicación y las condiciones académicas de este espacio dentro del plan.
              </p>
            </div>
          </div>
        </header>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CurriculumDetailValue label="Carácter" value={requirementTypeLabels[space.requirementType]} />
          <CurriculumDetailValue label="Nivel" value={space.academicLevelName ?? "Sin nivel asignado"} />
          <CurriculumDetailValue label="Aprobación" value={approvalModeLabels[space.approvalMode]} />
          <CurriculumDetailValue label="Orden" value={String(space.displayOrder)} />
        </dl>
      </section>

      <section
        aria-labelledby="study-plan-space-prerequisites-title"
        className="bg-muted/25 rounded-xl border p-5 md:p-6"
      >
        <header className="-mx-5 flex flex-col gap-3 border-b px-5 pb-5 sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:px-6">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <GitBranchPlusIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="study-plan-space-prerequisites-title" className="text-base font-semibold">
                Correlatividades
              </h2>
              <p className="text-muted-foreground text-sm">Condiciones que deben cumplirse para cursar o aprobar.</p>
            </div>
          </div>
          {canEditCurriculum ? (
            <Button asChild size="lg">
              <Link href={`${planPath}/spaces/${space.id}/prerequisites/new`}>
                <PlusIcon data-icon="inline-start" />
                Nueva correlatividad
              </Link>
            </Button>
          ) : null}
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

function CurriculumDetailValue({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="bg-background rounded-lg border p-4">
      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

function getDetail(
  resource: Exclude<AcademicCollectionResource, AcademicResource.STUDY_PLAN>,
  item: AcademicCollection,
): {
  status: string;
  active: boolean;
  description: string;
  gridColsClass?: string;
  fields: { label: string; value: ReactNode; className?: string }[];
} {
  switch (resource) {
    case AcademicResource.ACADEMIC_YEAR: {
      if (!isAcademicYear(item)) return unsupportedDetailResource(resource);
      return {
        status: academicYearStatusLabels[item.status],
        active: item.status === "ACTIVE",
        description: "Consultá las fechas de vigencia y el estado del ciclo lectivo.",
        gridColsClass: "sm:grid-cols-3",
        fields: [
          {
            label: "Estado",
            value: (
              <Badge key="status" variant={item.status === "ACTIVE" ? "success" : "secondary"}>
                {academicYearStatusLabels[item.status]}
              </Badge>
            ),
          },
          { label: "Inicio", value: formatDisplayDate(item.startDate, "Sin definir") },
          { label: "Finalización", value: formatDisplayDate(item.endDate, "Sin definir") },
        ],
      };
    }
    case AcademicResource.ACADEMIC_SPACE: {
      if (!isAcademicSpace(item)) return unsupportedDetailResource(resource);
      return {
        status: item.active ? "Activo" : "Inactivo",
        active: item.active,
        description: "Consultá los datos generales y el estado del espacio académico.",
        gridColsClass: "sm:grid-cols-2",
        fields: [
          { label: "Tipo", value: academicSpaceTypeLabels[item.type] },
          {
            label: "Estado",
            value: (
              <Badge key="status" variant={item.active ? "success" : "secondary"}>
                {item.active ? "Activo" : "Inactivo"}
              </Badge>
            ),
          },
          {
            label: "Descripción",
            value: item.description || "Sin descripción",
            className: "sm:col-span-2",
          },
        ],
      };
    }
    case AcademicResource.TRAINING_PATH: {
      if (!hasActiveAcademicStatus(item)) return unsupportedDetailResource(resource);
      return {
        status: item.active ? "Activo" : "Inactivo",
        active: item.active,
        description: "Consultá los datos generales y el estado del trayecto formativo.",
        gridColsClass: "sm:grid-cols-2",
        fields: [
          {
            label: "Estado",
            value: (
              <Badge key="status" variant={item.active ? "success" : "secondary"}>
                {item.active ? "Activo" : "Inactivo"}
              </Badge>
            ),
          },
          { label: "Descripción", value: item.description || "Sin descripción" },
        ],
      };
    }
    case AcademicResource.INSTRUMENT: {
      if (!hasActiveAcademicStatus(item)) return unsupportedDetailResource(resource);
      return {
        status: item.active ? "Activo" : "Inactivo",
        active: item.active,
        description: "Consultá los datos generales y el estado del instrumento.",
        gridColsClass: "sm:grid-cols-2",
        fields: [
          {
            label: "Estado",
            value: (
              <Badge key="status" variant={item.active ? "success" : "secondary"}>
                {item.active ? "Activo" : "Inactivo"}
              </Badge>
            ),
          },
          { label: "Descripción", value: item.description || "Sin descripción" },
        ],
      };
    }
  }
}

function isAcademicYear(item: AcademicCollection): item is AcademicYear {
  return "year" in item;
}

function isAcademicSpace(item: AcademicCollection): item is AcademicSpace {
  return "type" in item;
}

function unsupportedDetailResource(resource: AcademicCollectionResource): never {
  throw new Error(`Unsupported academic detail resource: ${resource}.`);
}
