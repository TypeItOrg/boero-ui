import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@common/components/ui/card";
import { Separator } from "@common/components/ui/separator";
import { formatDisplayDate } from "@common/utils/date-input.util";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { AcademicDeleteButton } from "@features/academic/components/academic-delete-button";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import type { AcademicSpace } from "@features/academic/types/academic-space.types";
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

type AcademicDetailProps = {
  item: AcademicCollection;
  resource: AcademicCollectionResource;
  basePath: string;
  canEdit: boolean;
  statusAction?: ReactNode;
};

export function AcademicDetail({
  item,
  resource,
  basePath,
  canEdit,
  statusAction,
}: AcademicDetailProps): React.ReactElement {
  if (resource === AcademicResource.STUDY_PLAN) return <StudyPlanSummary plan={item as StudyPlan} />;

  const detail = getDetail(resource, item);
  const detailPath = `${basePath}/${resource}/${item.id}`;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant={detail.active ? "success" : "secondary"}>{detail.status}</Badge>
        </div>
        {canEdit || statusAction ? (
          <div className="flex gap-2">
            {canEdit ? (
              <Button asChild size="lg" variant="outline">
                <ReturnToLink href={`${detailPath}/edit`}>Editar</ReturnToLink>
              </Button>
            ) : null}
            {statusAction}
          </div>
        ) : null}
      </div>
      <Card className="bg-muted/25">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Información</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {detail.fields.map(([label, value]) => (
            <div key={label} className="bg-background rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
              <p className="mt-1 font-medium">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StudyPlanSummary({ plan }: { plan: StudyPlan }): React.ReactElement {
  return (
    <section aria-labelledby="study-plan-summary-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
      <header>
        <h2 id="study-plan-summary-title" className="text-base font-semibold">
          Resumen
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Consultá el trayecto formativo, el estado y el período de vigencia del plan.
        </p>
      </header>

      <Separator className="mt-5" />

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
}) {
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge>{requirementTypeLabels[space.requirementType]}</Badge>
          <h2 className="mt-3 text-2xl font-semibold">{space.academicSpaceName}</h2>
          <p className="text-muted-foreground mt-1">
            {space.academicLevelName ?? "Sin nivel asignado"} · {approvalModeLabels[space.approvalMode]}
          </p>
        </div>
        {canEditCurriculum ? (
          <div className="flex gap-2">
            <Button asChild variant="outline">
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
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Correlatividades</CardTitle>
          {canEditCurriculum ? (
            <Button asChild size="sm">
              <Link href={`${planPath}/spaces/${space.id}/prerequisites/new`}>Nueva correlatividad</Link>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {prerequisites.length === 0 ? (
            <p className="text-muted-foreground text-sm">Este espacio no tiene correlatividades configuradas.</p>
          ) : (
            prerequisites.map((item) => (
              <Link
                key={item.id}
                href={`${planPath}/spaces/${space.id}/prerequisites/${item.id}/edit`}
                className="hover:bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <span className="font-medium">{names.get(item.requiredStudyPlanSpaceId) ?? "Espacio requerido"}</span>
                <span className="text-muted-foreground text-sm">
                  {requirementStageLabels[item.requirementStage]} · {requiredConditionLabels[item.requiredCondition]}
                </span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getDetail(
  resource: Exclude<AcademicCollectionResource, AcademicResource.STUDY_PLAN>,
  item: AcademicCollection,
): {
  status: string;
  active: boolean;
  fields: [string, string][];
} {
  switch (resource) {
    case AcademicResource.ACADEMIC_YEAR: {
      if (!isAcademicYear(item)) return unsupportedDetailResource(resource);
      return {
        status: academicYearStatusLabels[item.status],
        active: item.status === "ACTIVE",
        fields: [
          ["Inicio", formatDisplayDate(item.startDate, "Sin definir")],
          ["Finalización", formatDisplayDate(item.endDate, "Sin definir")],
        ],
      };
    }
    case AcademicResource.ACADEMIC_SPACE: {
      if (!isAcademicSpace(item)) return unsupportedDetailResource(resource);
      return {
        status: item.active ? "Activo" : "Inactivo",
        active: item.active,
        fields: [
          ["Tipo", academicSpaceTypeLabels[item.type]],
          ["Descripción", item.description || "Sin descripción"],
          ["Estado", item.active ? "Disponible" : "No disponible"],
        ],
      };
    }
    case AcademicResource.TRAINING_PATH:
    case AcademicResource.INSTRUMENT: {
      if (!hasActiveAcademicStatus(item)) return unsupportedDetailResource(resource);
      return {
        status: item.active ? "Activo" : "Inactivo",
        active: item.active,
        fields: [["Descripción", item.description || "Sin descripción"]],
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
