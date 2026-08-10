import Link from "next/link";
import { BookOpenCheckIcon, Layers3Icon, PlusIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { AcademicDeleteButton } from "@features/academic/components/academic-delete-button";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { StudyPlanCurriculum } from "@features/academic/types/study-plan-curriculum.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import { approvalModeLabels, requirementTypeLabels } from "@features/academic/utils/academic-labels.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type StudyPlanCurriculumProps = {
  curriculum: StudyPlanCurriculum;
  basePath: string;
  canEditCurriculum: boolean;
  institutionId: string;
  scope: AcademicScope;
};

export function StudyPlanCurriculumView({
  curriculum,
  basePath,
  canEditCurriculum,
  institutionId,
  scope,
}: StudyPlanCurriculumProps): React.ReactElement {
  const planPath = `${basePath}/study-plans/${curriculum.studyPlan.id}`;
  const hasSpaces =
    curriculum.levels.some((level) => level.spaces.length > 0) || curriculum.unassignedSpaces.length > 0;
  const isEmpty = !hasSpaces && curriculum.levels.length === 0;

  return (
    <section className="bg-muted/25 rounded-xl border p-5 md:p-6">
      <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Estructura curricular</h2>
          <p className="text-muted-foreground text-sm">
            Organizá los niveles y espacios académicos que forman parte de este plan.
          </p>
        </div>
        {canEditCurriculum ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg" variant="outline">
              <Link href={`${planPath}/academic-levels/new`}>
                <Layers3Icon data-icon="inline-start" />
                Nuevo nivel
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href={`${planPath}/spaces/new`}>
                <PlusIcon data-icon="inline-start" />
                Incorporar espacio
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      {isEmpty ? (
        <Empty className="bg-background mt-5 min-h-72 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpenCheckIcon />
            </EmptyMedia>
            <EmptyTitle>La currícula todavía está vacía</EmptyTitle>
            <EmptyDescription>Creá los niveles y luego incorporá espacios académicos al plan.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {curriculum.levels.map(({ level, spaces }, levelIndex) => (
            <section key={level.id} className="bg-background overflow-hidden rounded-xl border">
              <header className="bg-background flex items-center justify-between gap-4 border-b px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-semibold">
                    {levelIndex + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">{level.name}</h3>
                    {level.description ? <p className="text-muted-foreground text-xs">{level.description}</p> : null}
                  </div>
                </div>
                {canEditCurriculum ? (
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="lg">
                      <Link href={`${planPath}/academic-levels/${level.id}/edit`}>Editar nivel</Link>
                    </Button>
                    <AcademicDeleteButton
                      scope={scope}
                      institutionId={institutionId}
                      resource={AcademicResource.ACADEMIC_LEVEL}
                      id={level.id}
                      destination={planPath}
                      label="el nivel"
                      size="lg"
                    />
                  </div>
                ) : null}
              </header>
              <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
                {spaces.length > 0 ? (
                  spaces.map((space) => (
                    <CurriculumSpaceCard
                      key={space.id}
                      canEditCurriculum={canEditCurriculum}
                      institutionId={institutionId}
                      planPath={planPath}
                      scope={scope}
                      space={space}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground p-3 text-sm">No hay espacios asignados a este nivel.</p>
                )}
              </div>
            </section>
          ))}

          {curriculum.unassignedSpaces.length > 0 ? (
            <section className="bg-background rounded-xl border border-dashed p-4">
              <div className="mb-3">
                <h3 className="text-base font-semibold">Sin nivel asignado</h3>
                <p className="text-muted-foreground text-sm">Espacios transversales o pendientes de ubicación.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {curriculum.unassignedSpaces.map((space) => (
                  <CurriculumSpaceCard
                    key={space.id}
                    canEditCurriculum={canEditCurriculum}
                    institutionId={institutionId}
                    planPath={planPath}
                    scope={scope}
                    space={space}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </section>
  );
}

type CurriculumSpaceCardProps = {
  canEditCurriculum: boolean;
  institutionId: string;
  planPath: string;
  scope: AcademicScope;
  space: StudyPlanSpace;
};

function CurriculumSpaceCard({
  canEditCurriculum,
  institutionId,
  planPath,
  scope,
  space,
}: CurriculumSpaceCardProps): React.ReactElement {
  const spacePath = `${planPath}/spaces/${space.id}`;

  return (
    <Card size="sm" className="bg-background h-full">
      <Link
        className="flex flex-1 flex-col gap-3 rounded-t-xl focus-visible:ring-2 focus-visible:outline-none"
        href={spacePath}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base font-semibold">{space.academicSpaceName}</CardTitle>
            <span className="text-muted-foreground shrink-0 text-xs">Orden {space.displayOrder}</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant={space.requirementType === "REQUIRED" ? "default" : "outline"}>
            {requirementTypeLabels[space.requirementType]}
          </Badge>
          <Badge variant="secondary">{approvalModeLabels[space.approvalMode]}</Badge>
        </CardContent>
      </Link>
      {canEditCurriculum ? (
        <CardFooter className="justify-end gap-2">
          <Button asChild size="sm" variant="ghost">
            <ReturnToLink href={`${spacePath}/edit`} returnTo={planPath}>
              Editar
            </ReturnToLink>
          </Button>
          <AcademicDeleteButton
            destination={planPath}
            id={space.id}
            institutionId={institutionId}
            label={`el espacio “${space.academicSpaceName}”`}
            resource={AcademicResource.STUDY_PLAN_SPACE}
            scope={scope}
            size="sm"
          />
        </CardFooter>
      ) : null}
    </Card>
  );
}
