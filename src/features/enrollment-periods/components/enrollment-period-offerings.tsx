"use client";

import { formatStudyPlanLabel, formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";
import { useCallback, useEffect, useState } from "react";
import { BookOpenCheckIcon, Trash2Icon } from "lucide-react";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { FieldLabel } from "@common/components/ui/field";
import { Skeleton } from "@common/components/ui/skeleton";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { cn } from "@common/utils/cn.util";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicLevel } from "@features/academic/types/academic-level.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { EnrollmentPeriodOffering } from "@features/enrollment-periods/types/enrollment-period-offering.types";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";

type Props = {
  operation: "ENROLLMENT_PERIOD_CREATE" | "ENROLLMENT_PERIOD_UPDATE";
  institutionId: string;
  scope: AcademicScope;
  value: EnrollmentPeriodOffering[];
  onChange: (value: EnrollmentPeriodOffering[]) => void;
  disabled: boolean;
};

export function EnrollmentPeriodOfferings({ institutionId, scope, value, onChange, disabled, operation }: Props): React.ReactElement {
  const fetchPlans = useCallback(
    (input: AsyncDropdownFetchPageInput) =>
      fetchAcademicOptionPage<StudyPlan>("study-plans", scope, institutionId, input, { active: "all", status: "ACTIVE", operation }),
    [institutionId, scope, operation],
  );
  return (
    <section className="bg-muted/25 grid gap-5 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
            <BookOpenCheckIcon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Oferta de la convocatoria</h2>
            <p className="text-muted-foreground text-sm">
              Elegí los planes y niveles disponibles. Con solicitudes enviadas, solo podés ampliar la oferta.
            </p>
          </div>
        </div>
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

function OfferingLevels({
  operation,
  offering,
  institutionId,
  scope,
  disabled,
  onChange,
  onRemove,
}: {
  operation: "ENROLLMENT_PERIOD_CREATE" | "ENROLLMENT_PERIOD_UPDATE";
  offering: EnrollmentPeriodOffering;
  institutionId: string;
  scope: AcademicScope;
  disabled: boolean;
  onChange: (value: EnrollmentPeriodOffering) => void;
  onRemove: () => void;
}): React.ReactElement {
  const [levels, setLevels] = useState<AcademicLevel[] | null>(null);
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ institutionId, scope, studyPlanId: offering.studyPlanId, operation });
    fetch(`/api/enrollment-period-curriculum?${params}`, { signal: controller.signal, cache: "no-store" })
      .then((response) => parseHttpResponse<AcademicLevel[]>(response, ENROLLMENT_MESSAGES.PERIOD_SCOPE_LOAD_FAILED))
      .then((result) => {
        setLevels(result);
        setError(undefined);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(ENROLLMENT_MESSAGES.PERIOD_SCOPE_LOAD_FAILED);
        }
      });
    return () => controller.abort();
  }, [institutionId, scope, offering.studyPlanId, operation, attempt]);
  return (
    <article className="bg-background overflow-hidden rounded-xl border shadow-xs">
      <header className="bg-muted/20 flex items-start justify-between gap-4 border-b px-4 py-3.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold">{offering.trainingPathName}</h3>
          </div>
          <p className="text-muted-foreground mt-0.5 truncate text-sm">{formatStudyPlanName(offering)}</p>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Quitar ${formatStudyPlanLabel(offering)}`}
        >
          <Trash2Icon data-icon="inline-start" aria-hidden="true" />
          Quitar
        </Button>
      </header>
      {error ? (
        <div role="alert" className="text-destructive px-4 py-5 text-sm">
          {error}{" "}
          <Button type="button" variant="link" onClick={() => setAttempt(attempt + 1)}>
            Reintentar
          </Button>
        </div>
      ) : !levels ? (
        <div role="status" className="grid gap-3 p-4">
          <Skeleton className="h-4 w-32" aria-hidden="true" />
          <Skeleton className="h-10 w-full" aria-hidden="true" />
          <span className="sr-only">Cargando niveles</span>
        </div>
      ) : (
        <div className="grid gap-4 p-4">
          {levels.length === 0 ? (
            <p className="text-muted-foreground text-sm">Este plan no tiene niveles.</p>
          ) : (
            <fieldset className="grid gap-2.5">
              <legend className="mb-2 text-sm font-medium">Niveles habilitados</legend>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-2">
                {levels.map((level) => {
                  const isSelected = offering.academicLevels.some((selected) => selected.id === level.id);

                  return (
                    <label
                      key={level.id}
                      className={cn(
                        "hover:bg-muted/40 flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                        isSelected && "border-primary/40 bg-primary/5 hover:bg-primary/10",
                        disabled && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={disabled}
                        onCheckedChange={(checked) =>
                          onChange({
                            ...offering,
                            academicLevels:
                              checked === true
                                ? [...offering.academicLevels.filter((item) => item.id !== level.id), level]
                                : offering.academicLevels.filter((item) => item.id !== level.id),
                          })
                        }
                      />
                      <span className="font-medium">{level.name}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
          <label
            className={cn(
              "bg-muted/25 hover:bg-muted/40 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
              offering.includeUnassigned && "border-primary/40 bg-primary/5 hover:bg-primary/10",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <Checkbox
              className="mt-0.5"
              checked={offering.includeUnassigned}
              disabled={disabled}
              onCheckedChange={(checked) => onChange({ ...offering, includeUnassigned: checked === true })}
            />
            <span className="text-sm font-medium">Espacios sin nivel asignado</span>
          </label>
        </div>
      )}
    </article>
  );
}
