import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpenCheckIcon, InfoIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { cn } from "@common/utils/cn.util";
import { formatDisplayDate } from "@common/utils/date-input.util";
import { AcademicSpaceUsage, AcademicSpaceUsageWarning } from "@features/academic/components/academic-space-usage";
import { StudyPlanSpaceDetail } from "@features/academic/components/study-plan-space-detail";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import type { AcademicSpaceUsage as AcademicSpaceUsageData } from "@features/academic/types/academic-space-usage.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import { getAcademicDetailInfo } from "@features/academic/utils/academic-detail-fields.util";
import { studyPlanStatusLabels } from "@features/academic/utils/academic-labels.util";

export { StudyPlanSpaceDetail };

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

  const detail = getAcademicDetailInfo(resource, item);
  const academicSpaceWarning =
    resource === AcademicResource.ACADEMIC_SPACE && academicSpaceUsage?.summary.deactivationBlocked ? (
      <AcademicSpaceUsageWarning blockingPlanCount={academicSpaceUsage.summary.activePlans + academicSpaceUsage.summary.draftPlans} />
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
            <p className="text-muted-foreground text-sm">Consultá el trayecto formativo, el estado y el período de vigencia del plan.</p>
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
            <Badge variant={plan.status === "ACTIVE" ? "success" : "secondary"}>{studyPlanStatusLabels[plan.status]}</Badge>
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

function formatStudyPlanValidity({ effectiveFrom, effectiveTo }: Pick<StudyPlan, "effectiveFrom" | "effectiveTo">): string {
  if (!effectiveFrom && !effectiveTo) return "Sin período definido";

  if (effectiveFrom && !effectiveTo) return `Desde ${formatDisplayDate(effectiveFrom)}`;

  if (!effectiveFrom && effectiveTo) return `Hasta ${formatDisplayDate(effectiveTo)}`;

  return `${formatDisplayDate(effectiveFrom)} — ${formatDisplayDate(effectiveTo)}`;
}
