import { formatStudyPlanName, formatStudyPlanLabel } from "@features/academic/utils/study-plan-label.util";
import { ArrowRightIcon, BookOpenIcon, CalendarDaysIcon, RouteIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Badge } from "@common/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { formatDisplayDate } from "@common/utils/date-input.util";
import { AcademicOfferPagination } from "@features/academic-offers/components/academic-offer-pagination";
import type { AcademicOfferSummary } from "@features/academic-offers/types/academic-offer-summary.types";

type AcademicOfferListProps = {
  items: AcademicOfferSummary[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export function AcademicOfferList({ items, page, size, totalItems, totalPages }: AcademicOfferListProps): React.ReactElement {
  if (items.length === 0) {
    return (
      <Empty className="bg-muted/25 min-h-56 rounded-xl border border-solid p-6">
        <EmptyHeader className="max-w-md">
          <EmptyMedia variant="icon">
            <RouteIcon className="size-5" />
          </EmptyMedia>
          <EmptyTitle className="text-base">No hay trayectos disponibles</EmptyTitle>
          <EmptyDescription>Cuando la institución habilite un plan de estudio vigente, vas a encontrarlo en esta sección.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col justify-between gap-5">
      <div className="flex flex-col gap-3">
        {items.map((offer) => (
          <AcademicOfferCard key={offer.studyPlanId} offer={offer} />
        ))}
      </div>
      <div className="border-t pt-4">
        <AcademicOfferPagination page={page} size={size} totalItems={totalItems} totalPages={totalPages} />
      </div>
    </div>
  );
}

function AcademicOfferCard({ offer }: { offer: AcademicOfferSummary }): React.ReactElement {
  const studyPlanLabel = formatStudyPlanName(offer);

  return (
    <article className="bg-background border-border min-w-0 rounded-xl border">
      <div className="flex flex-col gap-4 p-5 @3xl/page-shell:flex-row @3xl/page-shell:items-center @3xl/page-shell:gap-8 @3xl/page-shell:p-6">
        <div className="flex min-w-0 flex-1 items-stretch gap-4">
          <span className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center self-start rounded-xl">
            <RouteIcon aria-hidden="true" className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg leading-snug font-semibold break-words @3xl/page-shell:text-xl">{offer.trainingPathName}</h2>
            {offer.trainingPathDescription ? (
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed break-words">{offer.trainingPathDescription}</p>
            ) : null}
            <div className="mt-1.5 flex flex-col gap-x-3 gap-y-1.5 text-sm @3xl/page-shell:flex-row @3xl/page-shell:flex-wrap">
              <p className="flex min-w-0 items-start gap-2">
                <BookOpenIcon aria-hidden="true" className="text-primary/70 mt-0.5 size-4 shrink-0" />
                <span className="break-words">
                  <span className="text-muted-foreground">Plan de estudio: </span>
                  <span className="font-medium">{studyPlanLabel}</span>
                </span>
              </p>
              <p className="text-muted-foreground flex items-start gap-2">
                <CalendarDaysIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>
                  {offer.effectiveTo
                    ? `Vigente del ${formatDisplayDate(offer.effectiveFrom)} al ${formatDisplayDate(offer.effectiveTo)}`
                    : `Vigente desde ${formatDisplayDate(offer.effectiveFrom)}`}
                </span>
              </p>
              {offer.enrollmentOpen ? <Badge variant="success">Inscripción habilitada</Badge> : null}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 self-end @3xl/page-shell:self-center">
          <ReturnToLink
            href={`/academic-offers/${offer.studyPlanId}`}
            aria-label={`Ver espacios académicos de ${formatStudyPlanLabel(offer)}`}
            title="Ver espacios académicos"
            className="border-primary/20 bg-primary/5 text-primary hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:ring-ring focus-visible:bg-primary focus-visible:text-primary-foreground inline-flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <ArrowRightIcon aria-hidden="true" className="size-5" />
          </ReturnToLink>
        </div>
      </div>
    </article>
  );
}
