import type { ReactElement } from "react";

import { BookOpenCheckIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Badge } from "@common/components/ui/badge";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";
import { formatDisplayDate } from "@common/utils/date-input.util";

import type { StudyPlan } from "@features/academic/types/study-plan.types";
import { studyPlanStatusLabels } from "@features/academic/utils/academic-labels.util";

export function StudyPlanSummary({ plan }: { plan: StudyPlan }): ReactElement {
  return (
    <section aria-labelledby="study-plan-summary-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={BookOpenCheckIcon}
          title="Resumen"
          description="Consultá el trayecto formativo, el estado y el período de vigencia del plan."
          titleId="study-plan-summary-title"
        />
      </header>

      <dl className="grid gap-5 pt-5 sm:grid-cols-3">
        <div>
          <dt className={DETAIL_LABEL_CLASS_NAME}>Trayecto formativo</dt>
          <dd className="mt-1 font-semibold">{plan.trainingPathName}</dd>
        </div>
        <div>
          <dt className={DETAIL_LABEL_CLASS_NAME}>Estado</dt>
          <dd className="mt-1">
            <Badge variant={plan.status === "ACTIVE" ? "success" : "secondary"}>{studyPlanStatusLabels[plan.status]}</Badge>
          </dd>
        </div>
        <div>
          <dt className={DETAIL_LABEL_CLASS_NAME}>Vigencia</dt>
          <dd className="mt-1 font-semibold tabular-nums">{formatStudyPlanValidity(plan)}</dd>
        </div>
      </dl>
    </section>
  );
}

export function formatStudyPlanValidity({ effectiveFrom, effectiveTo }: Pick<StudyPlan, "effectiveFrom" | "effectiveTo">): string {
  if (!effectiveFrom && !effectiveTo) {
    return "Sin período definido";
  }

  if (effectiveFrom && !effectiveTo) {
    return `Desde ${formatDisplayDate(effectiveFrom)}`;
  }

  if (!effectiveFrom && effectiveTo) {
    return `Hasta ${formatDisplayDate(effectiveTo)}`;
  }

  return `Del ${formatDisplayDate(effectiveFrom)} al ${formatDisplayDate(effectiveTo)}`;
}
