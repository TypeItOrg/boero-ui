import type { ReactElement } from "react";

import { CircleAlertIcon, Layers3Icon, LibraryBigIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";

import { AcademicSpaceUsagePagination } from "@features/academic/components/academic-space-usage-pagination";
import { AcademicSpaceUsagePlanCard } from "@features/academic/components/academic-space-usage-plan-card";
import type { AcademicSpaceUsage } from "@features/academic/types/academic-space-usage.types";

type AcademicSpaceUsageProps = {
  basePath: string;
  usage: AcademicSpaceUsage;
};

export function AcademicSpaceUsage({ basePath, usage }: AcademicSpaceUsageProps): ReactElement {
  const { plans, summary } = usage;

  const operationalPlans = summary.activePlans + summary.draftPlans;

  return (
    <section aria-labelledby="academic-space-usage-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={LibraryBigIcon}
          title="Uso en planes de estudio"
          description="Consultá dónde aparece este espacio y qué impacto tiene sobre la estructura curricular."
          titleId="academic-space-usage-title"
        />
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <UsageMetric label="Planes asociados" value={summary.totalPlans} />
        <UsageMetric label="En operación" value={operationalPlans} />
        <UsageMetric label="Ubicaciones curriculares" value={summary.totalPlacements} />
      </div>

      {plans.items.length === 0 ? (
        <Empty className="bg-background mt-5 min-h-64 rounded-xl border border-solid px-4 py-10">
          <EmptyHeader className="max-w-md">
            <EmptyMedia variant="icon">
              <Layers3Icon className="size-5" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="mt-2 text-base">Este espacio todavía no está incorporado a ningún plan</EmptyTitle>
            <EmptyDescription>Cuando forme parte de una estructura curricular, vas a poder consultar sus ubicaciones acá.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,22rem),1fr))] gap-4">
            {plans.items.map((plan) => (
              <AcademicSpaceUsagePlanCard key={plan.studyPlanId} basePath={basePath} plan={plan} />
            ))}
          </div>
          {plans.totalPages > 1 ? (
            <div className="-mx-5 mt-5 border-t px-5 pt-5 md:-mx-6 md:px-6">
              <AcademicSpaceUsagePagination page={plans.page} size={plans.size} totalItems={plans.totalItems} totalPages={plans.totalPages} />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

export function AcademicSpaceUsageWarning({ blockingPlanCount }: { blockingPlanCount: number }): ReactElement {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>No se puede desactivar este espacio</AlertTitle>
      <AlertDescription>
        Está siendo utilizado por {blockingPlanCount} {blockingPlanCount === 1 ? "plan activo o en edición" : "planes activos o en edición"}. Primero
        tenés que modificar esos planes.
      </AlertDescription>
    </Alert>
  );
}

function UsageMetric({ label, value }: { label: string; value: number }): ReactElement {
  return (
    <div className="bg-background rounded-xl border p-4">
      <p className={DETAIL_LABEL_CLASS_NAME}>{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}
