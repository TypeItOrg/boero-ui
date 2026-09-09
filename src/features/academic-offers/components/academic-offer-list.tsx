import Link from "next/link";
import { ArrowRightIcon, BookOpenCheckIcon, CalendarRangeIcon, RouteIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
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
      <Empty className="bg-muted/20 min-h-80 border">
        <EmptyHeader className="max-w-md">
          <EmptyMedia variant="icon" className="text-primary size-12 rounded-full">
            <RouteIcon className="size-6" />
          </EmptyMedia>
          <EmptyTitle className="text-base">No hay trayectos disponibles</EmptyTitle>
          <EmptyDescription>Cuando la institución habilite un plan de estudio vigente, vas a encontrarlo en esta sección.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((offer) => (
          <AcademicOfferCard key={offer.studyPlanId} offer={offer} />
        ))}
      </div>
      <AcademicOfferPagination page={page} size={size} totalItems={totalItems} totalPages={totalPages} />
    </div>
  );
}

function AcademicOfferCard({ offer }: { offer: AcademicOfferSummary }): React.ReactElement {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
            <RouteIcon aria-hidden="true" className="size-5" />
          </span>
          <Badge variant="success">Inscripción habilitada</Badge>
        </div>
        <div>
          <CardTitle className="text-lg font-semibold">{offer.trainingPathName}</CardTitle>
          {offer.trainingPathDescription ? <p className="text-muted-foreground mt-1 line-clamp-3 text-sm">{offer.trainingPathDescription}</p> : null}
        </div>
      </CardHeader>
      <CardContent className="mt-auto grid gap-2 text-sm">
        <p className="flex items-center gap-2">
          <BookOpenCheckIcon aria-hidden="true" className="text-muted-foreground size-4" />
          <span>{offer.studyPlanName}</span>
          <Badge variant="outline">Versión {offer.studyPlanVersion}</Badge>
        </p>
        <p className="text-muted-foreground flex items-center gap-2">
          <CalendarRangeIcon aria-hidden="true" className="size-4" />
          {formatValidity(offer.effectiveFrom, offer.effectiveTo)}
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <Link
          href={`/academic-offers/${offer.studyPlanId}`}
          className="text-primary focus-visible:ring-ring inline-flex items-center gap-2 rounded-md font-semibold hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Ver espacios académicos
          <ArrowRightIcon aria-hidden="true" className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}

function formatValidity(effectiveFrom: string, effectiveTo: string | null): string {
  if (!effectiveTo) return `Vigente desde ${formatDisplayDate(effectiveFrom)}`;
  return `Vigente del ${formatDisplayDate(effectiveFrom)} al ${formatDisplayDate(effectiveTo)}`;
}
