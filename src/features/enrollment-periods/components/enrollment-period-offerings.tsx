"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpenCheckIcon, Trash2Icon } from "lucide-react";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { FieldLabel } from "@common/components/ui/field";
import { Skeleton } from "@common/components/ui/skeleton";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
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
          getItemLabel={(plan) => `${plan.trainingPathName} · ${plan.name} · v${plan.versionNumber ?? 1}`}
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
        <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
          Todavía no hay planes seleccionados. La convocatoria necesita una oferta explícita.
        </p>
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
    <div className="bg-background grid gap-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{offering.trainingPathName}</p>
          <p className="text-muted-foreground text-sm">
            {offering.studyPlanName} · Versión {offering.versionNumber}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive shrink-0"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Quitar ${offering.studyPlanName}`}
        >
          <Trash2Icon aria-hidden="true" />
        </Button>
      </div>
      {error ? (
        <div role="alert" className="text-destructive text-sm">
          {error}{" "}
          <Button type="button" variant="link" onClick={() => setAttempt(attempt + 1)}>
            Reintentar
          </Button>
        </div>
      ) : !levels ? (
        <div role="status">
          <Skeleton className="h-10 w-full" aria-hidden="true" />
          <span className="sr-only">Cargando niveles</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {levels.length === 0 ? (
            <p className="text-muted-foreground text-sm">Este plan no tiene niveles.</p>
          ) : (
            levels.map((level) => (
              <label key={level.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <Checkbox
                  checked={offering.academicLevels.some((selected) => selected.id === level.id)}
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
                {level.name}
              </label>
            ))
          )}
          <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <Checkbox
              checked={offering.includeUnassigned}
              disabled={disabled}
              onCheckedChange={(checked) => onChange({ ...offering, includeUnassigned: checked === true })}
            />
            Incluir espacios sin nivel asignado
          </label>
        </div>
      )}
    </div>
  );
}
