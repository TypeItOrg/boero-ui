"use client";

import { useCallback, useEffect, useState } from "react";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { FieldLabel } from "@common/components/ui/field";
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
      <header className="border-b pb-4">
        <h2 className="font-semibold">Oferta de la convocatoria</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Agregá los planes de cada trayecto y elegí sus niveles. Con solicitudes enviadas, solo se puede ampliar la oferta. Al reducirla, los cursos
          afectados se quitan automáticamente de los borradores.
        </p>
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
    <div className="bg-background grid gap-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{offering.trainingPathName}</p>
          <p className="text-muted-foreground text-sm">
            {offering.studyPlanName} · Versión {offering.versionNumber}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={disabled}>
          Quitar plan
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
        <p role="status" className="text-muted-foreground text-sm">
          Cargando niveles…
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {levels.map((level) => (
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
          ))}
          {levels.length > 0 ? (
            <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => onChange({ ...offering, academicLevels: levels })}>
              Seleccionar todos los niveles
            </Button>
          ) : (
            <p className="text-muted-foreground text-sm">Este plan no tiene niveles.</p>
          )}
        </div>
      )}
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={offering.includeUnassigned}
          disabled={disabled}
          onCheckedChange={(checked) => onChange({ ...offering, includeUnassigned: checked === true })}
        />
        Incluir espacios sin nivel asignado
      </label>
    </div>
  );
}
