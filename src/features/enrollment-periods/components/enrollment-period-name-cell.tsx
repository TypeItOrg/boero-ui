import { formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";
import { ENROLLMENT_PERIOD_MESSAGES } from "@features/enrollment-periods/constants/enrollment-period.messages";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";
import type { EnrollmentPeriodOffering } from "@features/enrollment-periods/types/enrollment-period-offering.types";

function getPlanLabel(offering: EnrollmentPeriodOffering) {
  const name = formatStudyPlanName(offering);

  return /^plan\b/i.test(name) ? name : `Plan ${name}`;
}

function getOfferingSummary(offerings: EnrollmentPeriodOffering[]) {
  const levels = offerings.flatMap((offering) => offering.academicLevels);
  const levelCount = new Set(levels.map((level) => level.id)).size;
  const planLabel = offerings.length === 1 ? getPlanLabel(offerings[0]) : `${offerings.length} planes`;
  const levelLabel = levelCount === 1 ? levels[0].name : levelCount > 1 ? `${levelCount} niveles` : null;

  return [planLabel, levelLabel, offerings.some((offering) => offering.includeUnassigned) ? ENROLLMENT_PERIOD_MESSAGES.unassignedLevel : null]
    .filter(Boolean)
    .join(" · ");
}

export function EnrollmentPeriodNameCell({ period }: { period: EnrollmentPeriod }) {
  const hasOfferings = period.scopeConfigured && period.offerings.length > 0;
  const summary = hasOfferings ? getOfferingSummary(period.offerings) : ENROLLMENT_PERIOD_MESSAGES.pendingOffering;

  return (
    <div className="space-y-1 whitespace-nowrap">
      <div className="font-medium">{period.name}</div>
      {period.limitedView ? <div className="text-muted-foreground text-xs">{ENROLLMENT_PERIOD_MESSAGES.limitedView}</div> : null}
      <div className="text-muted-foreground text-xs font-normal">{summary}</div>
    </div>
  );
}
