import { BookMarkedIcon, BookOpenCheckIcon, Layers3Icon, LibraryBigIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { formatDisplayDate } from "@common/utils/date-input.util";
import type { AcademicOfferDetail as AcademicOfferDetailType } from "@features/academic-offers/types/academic-offer-detail.types";
import type { AcademicOfferSpace } from "@features/academic-offers/types/academic-offer-space.types";
import {
  academicSpaceFormatLabels,
  academicSpaceTypeLabels,
  approvalModeLabels,
  requirementTypeLabels,
} from "@features/academic/utils/academic-labels.util";

export function AcademicOfferDetail({ detail }: { detail: AcademicOfferDetailType }): React.ReactElement {
  const hasSpaces = detail.levels.some((level) => level.spaces.length > 0) || detail.unassignedSpaces.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-muted/25 rounded-xl border p-5">
        <div className="bg-background flex w-full min-w-0 flex-col gap-4 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-stretch gap-3.5">
            <span className="bg-primary/10 text-primary flex min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <BookMarkedIcon aria-hidden="true" className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col justify-center">
              <h2 className="font-semibold">{detail.offer.studyPlanName}</h2>
              <p className="text-muted-foreground text-sm">{formatValidity(detail.offer.effectiveFrom, detail.offer.effectiveTo)}</p>
              {detail.offer.trainingPathDescription ? (
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{detail.offer.trainingPathDescription}</p>
              ) : null}
            </div>
          </div>
          <Badge variant="success" className="w-fit shrink-0">
            Inscripción habilitada
          </Badge>
        </div>
      </section>

      <section aria-labelledby="academic-offer-curriculum-title" className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
            <BookOpenCheckIcon aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 id="academic-offer-curriculum-title" className="text-lg font-semibold">
              Espacios académicos
            </h2>
            <p className="text-muted-foreground text-sm">Conocé la estructura del trayecto antes de inscribirte.</p>
          </div>
        </div>

        {!hasSpaces ? (
          <Empty className="bg-muted/20 min-h-64 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Layers3Icon />
              </EmptyMedia>
              <EmptyTitle>La propuesta todavía no tiene espacios publicados</EmptyTitle>
              <EmptyDescription>Consultá nuevamente cuando la institución complete la estructura académica.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-4">
            {detail.levels.map((level, index) => (
              <section key={level.id} className="overflow-hidden rounded-xl border">
                <header className="bg-muted/30 flex items-start gap-3 border-b px-4 py-3">
                  <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{level.name}</h3>
                    {level.description ? <p className="text-muted-foreground mt-0.5 text-sm">{level.description}</p> : null}
                  </div>
                </header>
                <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
                  {level.spaces.length > 0 ? (
                    level.spaces.map((space) => <AcademicOfferSpaceCard key={space.studyPlanSpaceId} space={space} />)
                  ) : (
                    <p className="text-muted-foreground p-3 text-sm">Este nivel no tiene espacios académicos activos.</p>
                  )}
                </div>
              </section>
            ))}

            {detail.unassignedSpaces.length > 0 ? (
              <section className="rounded-xl border p-4">
                <h3 className="font-semibold">Espacios transversales</h3>
                <p className="text-muted-foreground mt-0.5 text-sm">Forman parte del trayecto sin pertenecer a un nivel específico.</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {detail.unassignedSpaces.map((space) => (
                    <AcademicOfferSpaceCard key={space.studyPlanSpaceId} space={space} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

function AcademicOfferSpaceCard({ space }: { space: AcademicOfferSpace }): React.ReactElement {
  return (
    <Card size="sm" className="bg-muted/25 h-full">
      <CardHeader className="border-b">
        <div className="flex items-stretch gap-3">
          <span className="bg-primary/10 text-primary flex min-h-10 min-w-10 shrink-0 items-center justify-center self-stretch rounded-lg">
            <LibraryBigIcon aria-hidden="true" className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col justify-center">
            <CardTitle className="text-base font-semibold">{space.name}</CardTitle>
            <CardDescription className="line-clamp-3">{space.description ?? "Sin descripción disponible."}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-wrap gap-2">
        <Badge variant={space.requirementType === "REQUIRED" ? "default" : "outline"}>{requirementTypeLabels[space.requirementType]}</Badge>
        <Badge variant="secondary">{academicSpaceTypeLabels[space.type]}</Badge>
        <Badge variant="outline">{academicSpaceFormatLabels[space.format]}</Badge>
        <Badge variant="outline">{approvalModeLabels[space.approvalMode]}</Badge>
      </CardContent>
    </Card>
  );
}

function formatValidity(effectiveFrom: string, effectiveTo: string | null): string {
  if (!effectiveTo) return `Vigente desde ${formatDisplayDate(effectiveFrom)}`;
  return `${formatDisplayDate(effectiveFrom)} — ${formatDisplayDate(effectiveTo)}`;
}
