import { BookMarkedIcon, BookOpenCheckIcon, Layers3Icon, type LucideIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@common/components/ui/card";
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
      <section aria-labelledby="academic-offer-summary-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <AcademicOfferSectionHeader
          description="Consultá el plan de estudio, su vigencia y el estado de inscripción."
          icon={BookMarkedIcon}
          title="Información de la oferta"
          titleId="academic-offer-summary-title"
        />

        <div className="bg-background mt-5 flex w-full min-w-0 flex-col gap-4 rounded-xl border p-4 shadow-xs sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{detail.offer.studyPlanName}</h3>
            <p className="text-muted-foreground text-sm">{formatValidity(detail.offer.effectiveFrom, detail.offer.effectiveTo)}</p>
            {detail.offer.trainingPathDescription ? (
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{detail.offer.trainingPathDescription}</p>
            ) : null}
          </div>
          <Badge variant="success" className="w-fit shrink-0">
            Inscripción habilitada
          </Badge>
        </div>
      </section>

      <section aria-labelledby="academic-offer-curriculum-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <AcademicOfferSectionHeader
          description="Conocé la estructura del trayecto antes de inscribirte."
          icon={BookOpenCheckIcon}
          title="Espacios académicos"
          titleId="academic-offer-curriculum-title"
        />

        {!hasSpaces ? (
          <Empty className="bg-background mt-5 min-h-64 border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Layers3Icon />
              </EmptyMedia>
              <EmptyTitle>La propuesta todavía no tiene espacios publicados</EmptyTitle>
              <EmptyDescription>Consultá nuevamente cuando la institución complete la estructura académica.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            {detail.levels.map((level, index) => (
              <section key={level.id} className="bg-background overflow-hidden rounded-xl border">
                <header className="bg-background flex items-start gap-3 border-b px-4 py-3">
                  <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{level.name}</h3>
                    {level.description ? <p className="text-muted-foreground mt-0.5 text-sm">{level.description}</p> : null}
                  </div>
                </header>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-3 p-3">
                  {level.spaces.length > 0 ? (
                    level.spaces.map((space) => <AcademicOfferSpaceCard key={space.studyPlanSpaceId} space={space} />)
                  ) : (
                    <p className="text-muted-foreground p-3 text-sm">Este nivel no tiene espacios académicos activos.</p>
                  )}
                </div>
              </section>
            ))}

            {detail.unassignedSpaces.length > 0 ? (
              <section className="bg-background rounded-xl border p-4">
                <h3 className="font-semibold">Espacios transversales</h3>
                <p className="text-muted-foreground mt-0.5 text-sm">Forman parte del trayecto sin pertenecer a un nivel específico.</p>
                <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-3">
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

type AcademicOfferSectionHeaderProps = {
  description: string;
  icon: LucideIcon;
  title: string;
  titleId: string;
};

function AcademicOfferSectionHeader({ description, icon: Icon, title, titleId }: AcademicOfferSectionHeaderProps): React.ReactElement {
  return (
    <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
      <div className="flex items-center gap-3.5">
        <span className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </header>
  );
}

function AcademicOfferSpaceCard({ space }: { space: AcademicOfferSpace }): React.ReactElement {
  return (
    <Card size="sm" className="bg-background h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{space.name}</CardTitle>
        {space.description ? <p className="text-muted-foreground line-clamp-3 text-sm">{space.description}</p> : null}
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
