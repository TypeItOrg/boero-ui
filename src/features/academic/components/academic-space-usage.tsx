import { ArrowUpRightIcon, CalendarDaysIcon, CircleAlertIcon, Layers3Icon, LibraryBigIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { formatDisplayDate } from "@common/utils/date-input.util";
import { AcademicSpaceUsagePagination } from "@features/academic/components/academic-space-usage-pagination";
import type { AcademicSpaceUsage } from "@features/academic/types/academic-space-usage.types";
import type { StudyPlanStatus } from "@features/academic/types/study-plan-status.types";
import { approvalModeLabels, requirementTypeLabels, studyPlanStatusLabels } from "@features/academic/utils/academic-labels.util";

type AcademicSpaceUsageProps = {
  basePath: string;
  usage: AcademicSpaceUsage;
};

export function AcademicSpaceUsage({ basePath, usage }: AcademicSpaceUsageProps): React.ReactElement {
  const { plans, summary } = usage;
  const operationalPlans = summary.activePlans + summary.draftPlans;

  return (
    <section aria-labelledby="academic-space-usage-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
      <header className="border-b pb-5">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
            <LibraryBigIcon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="academic-space-usage-title" className="text-base font-semibold">
              Uso en planes de estudio
            </h2>
            <p className="text-muted-foreground text-sm">Consultá dónde aparece este espacio y qué impacto tiene sobre la estructura curricular.</p>
          </div>
        </div>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <UsageMetric label="Planes asociados" value={summary.totalPlans} />
        <UsageMetric label="En operación" value={operationalPlans} />
        <UsageMetric label="Ubicaciones curriculares" value={summary.totalPlacements} />
      </div>

      {plans.items.length === 0 ? (
        <div className="bg-background mt-5 flex min-h-64 flex-col items-center justify-center rounded-xl border px-4 py-10 text-center">
          <div className="bg-background text-primary mb-5 flex size-14 items-center justify-center rounded-full border shadow-xs">
            <Layers3Icon className="size-7" aria-hidden="true" />
          </div>
          <h3 className="text-foreground font-heading text-lg font-medium tracking-tight">Este espacio todavía no está incorporado a ningún plan</h3>
          <p className="text-muted-foreground mt-2 max-w-md text-sm/relaxed">
            Cuando forme parte de una estructura curricular, vas a poder consultar sus ubicaciones acá.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,22rem),1fr))] gap-4">
            {plans.items.map((plan) => (
              <AcademicSpaceUsagePlanCard key={plan.studyPlanId} basePath={basePath} plan={plan} />
            ))}
          </div>
          {plans.totalPages > 1 ? (
            <div className="mt-5 border-t pt-5">
              <AcademicSpaceUsagePagination page={plans.page} size={plans.size} totalItems={plans.totalItems} totalPages={plans.totalPages} />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

export function AcademicSpaceUsageWarning({ blockingPlanCount }: { blockingPlanCount: number }): React.ReactElement {
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

function UsageMetric({ label, value }: { label: string; value: number }): React.ReactElement {
  return (
    <div className="bg-background rounded-xl border p-4">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

function AcademicSpaceUsagePlanCard({
  basePath,
  plan,
}: {
  basePath: string;
  plan: AcademicSpaceUsage["plans"]["items"][number];
}): React.ReactElement {
  const planHref = `${basePath}/study-plans/${plan.studyPlanId}`;

  return (
    <Card size="sm" className="bg-background h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge variant={studyPlanStatusVariant(plan.status)}>{studyPlanStatusLabels[plan.status]}</Badge>
            <CardTitle className="mt-2 truncate text-base font-semibold">
              <ReturnToLink href={planHref} className="hover:text-primary transition-colors">
                {plan.name}
              </ReturnToLink>
            </CardTitle>
            <CardDescription className="mt-1 truncate">{plan.trainingPathName}</CardDescription>
          </div>
          <ReturnToLink
            href={planHref}
            aria-label={`Ver el plan ${plan.name}`}
            className="text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 rounded-lg p-1.5 transition-colors"
          >
            <ArrowUpRightIcon className="size-4" aria-hidden="true" />
          </ReturnToLink>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <CalendarDaysIcon className="size-3.5" aria-hidden="true" />
          <span>{formatPlanValidity(plan.effectiveFrom, plan.effectiveTo)}</span>
        </div>

        <div className="border-t pt-3">
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            {plan.placements.length === 1 ? "Ubicación curricular" : "Ubicaciones curriculares"}
          </p>
          <div className="flex flex-col gap-2">
            {plan.placements.map((placement) => (
              <div key={placement.studyPlanSpaceId} className="bg-muted/40 rounded-lg border p-3">
                <p className="text-sm font-medium">{placement.academicLevelName ?? "Sin nivel asignado"}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant={placement.requirementType === "REQUIRED" ? "default" : "outline"}>
                    {requirementTypeLabels[placement.requirementType]}
                  </Badge>
                  <Badge variant="secondary">{approvalModeLabels[placement.approvalMode]}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function studyPlanStatusVariant(status: StudyPlanStatus): "default" | "secondary" | "success" {
  if (status === "ACTIVE") return "success";
  if (status === "DRAFT") return "default";
  return "secondary";
}

function formatPlanValidity(effectiveFrom: string | null, effectiveTo: string | null): string {
  if (!effectiveFrom && !effectiveTo) return "Sin período definido";
  if (effectiveFrom && !effectiveTo) return `Desde ${formatDisplayDate(effectiveFrom)}`;
  if (!effectiveFrom && effectiveTo) return `Hasta ${formatDisplayDate(effectiveTo)}`;
  return `${formatDisplayDate(effectiveFrom)} — ${formatDisplayDate(effectiveTo)}`;
}
