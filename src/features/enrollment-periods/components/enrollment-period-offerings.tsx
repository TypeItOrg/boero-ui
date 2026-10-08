"use client";

import { useCallback, type ReactElement } from "react";

import { BookOpenCheckIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { FieldLabel } from "@common/components/ui/field";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";

import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { formatStudyPlanLabel } from "@features/academic/utils/study-plan-label.util";
import { OfferingLevels } from "@features/enrollment-periods/components/enrollment-period-offering-levels";
import type { EnrollmentPeriodOffering } from "@features/enrollment-periods/types/enrollment-period-offering.types";

type Props = {
  operation: "ENROLLMENT_PERIOD_CREATE" | "ENROLLMENT_PERIOD_UPDATE";
  institutionId: string;
  scope: AcademicScope;
  value: EnrollmentPeriodOffering[];
  onChange: (value: EnrollmentPeriodOffering[]) => void;
  disabled: boolean;
};

export function EnrollmentPeriodOfferings({ institutionId, scope, value, onChange, disabled, operation }: Props): ReactElement {
  const fetchPlans = useCallback(
    (input: AsyncDropdownFetchPageInput) =>
      fetchAcademicOptionPage<StudyPlan>("study-plans", scope, institutionId, input, {
        active: "all",
        status: "ACTIVE",
        operation,
      }),
    [institutionId, scope, operation],
  );

  return (
    <section className="bg-muted/25 grid gap-5 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={BookOpenCheckIcon}
          title="Oferta de la convocatoria"
          description="Elegí los planes y niveles disponibles. Con solicitudes enviadas, solo podés ampliar la oferta."
        />
      </header>
      <div className="grid gap-2">
        <FieldLabel htmlFor="offering-plan">Agregar trayecto y plan</FieldLabel>
        <AsyncDropdown<StudyPlan>
          id="offering-plan"
          fetchPage={fetchPlans}
          queryKey={["period-active-plans", scope, institutionId, operation]}
          getItemValue={(plan) => plan.id}
          getItemLabel={formatStudyPlanLabel}
          placeholder="Buscar trayecto o plan…"
          disabled={disabled}
          onValueChange={(_id, plan) => {
            if (plan && !value.some((offering) => offering.studyPlanId === plan.id)) {
              onChange([
                ...value,
                {
                  studyPlanId: plan.id,
                  studyPlanName: plan.name,
                  versionNumber: plan.versionNumber ?? 1,
                  trainingPathId: plan.trainingPathId,
                  trainingPathName: plan.trainingPathName,
                  academicLevels: [],
                  includeUnassigned: false,
                },
              ]);
            }
          }}
        />
      </div>
      {value.length === 0 ? (
        <Empty className="bg-background min-h-56 rounded-lg border border-solid p-6">
          <EmptyHeader className="max-w-md">
            <EmptyMedia variant="icon">
              <BookOpenCheckIcon className="size-5" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="mt-2 text-base">Todavía no hay planes seleccionados</EmptyTitle>
            <EmptyDescription>La convocatoria necesita una oferta explícita.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}
      {value.map((offering) => (
        <OfferingLevels
          operation={operation}
          key={offering.studyPlanId}
          offering={offering}
          institutionId={institutionId}
          scope={scope}
          disabled={disabled}
          onChange={(updated) => onChange(value.map((item) => (item.studyPlanId === updated.studyPlanId ? updated : item)))}
          onRemove={() => onChange(value.filter((item) => item.studyPlanId !== offering.studyPlanId))}
        />
      ))}
    </section>
  );
}
