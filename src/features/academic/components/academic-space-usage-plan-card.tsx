import type { ReactElement } from "react";

import { ArrowUpRightIcon, CalendarDaysIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Badge } from "@common/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";
import { formatDisplayDate } from "@common/utils/date-input.util";

import type { AcademicSpaceUsage } from "@features/academic/types/academic-space-usage.types";
import type { StudyPlanStatus } from "@features/academic/types/study-plan-status.types";
import { approvalModeLabels, requirementTypeLabels, studyPlanStatusLabels } from "@features/academic/utils/academic-labels.util";
import { formatStudyPlanLabel, formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";

export function AcademicSpaceUsagePlanCard({
  basePath,
  plan,
}: {
  basePath: string;
  plan: AcademicSpaceUsage["plans"]["items"][number];
}): ReactElement {
  const planHref = `${basePath}/study-plans/${plan.studyPlanId}`;

  return (
    <Card size="sm" className="bg-background h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge variant={studyPlanStatusVariant(plan.status)}>{studyPlanStatusLabels[plan.status]}</Badge>
            <CardTitle className="mt-2 truncate text-base font-semibold">
              <ReturnToLink href={planHref} className="hover:text-primary transition-colors">
                {formatStudyPlanName(plan)}
              </ReturnToLink>
            </CardTitle>
            <CardDescription className="mt-1 truncate">{plan.trainingPathName}</CardDescription>
          </div>
          <ReturnToLink
            href={planHref}
            aria-label={`Ver el plan ${formatStudyPlanLabel(plan)}`}
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

        <div className="-mx-(--card-spacing) border-t px-(--card-spacing) pt-3">
          <p className={`${DETAIL_LABEL_CLASS_NAME} mb-2`}>{plan.placements.length === 1 ? "Ubicación curricular" : "Ubicaciones curriculares"}</p>
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

export function studyPlanStatusVariant(status: StudyPlanStatus): "default" | "secondary" | "success" {
  if (status === "ACTIVE") {
    return "success";
  }

  if (status === "DRAFT") {
    return "default";
  }

  return "secondary";
}

export function formatPlanValidity(effectiveFrom: string | null, effectiveTo: string | null): string {
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
