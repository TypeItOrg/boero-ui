"use client";

import type { ReactElement } from "react";

import { useQuery } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { Skeleton } from "@common/components/ui/skeleton";
import { cn } from "@common/utils/cn.util";
import { parseHttpResponse } from "@common/utils/http-response-error.util";

import type { AcademicLevel } from "@features/academic/types/academic-level.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { formatStudyPlanLabel, formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { EnrollmentPeriodOffering } from "@features/enrollment-periods/types/enrollment-period-offering.types";

export function OfferingLevels({
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
}): ReactElement {
  const query = useQuery({
    queryKey: ["enrollment-period-levels", scope, institutionId, offering.studyPlanId, operation],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({ institutionId, scope, studyPlanId: offering.studyPlanId, operation });

      const response = await fetch(`/api/enrollment-period-curriculum?${params}`, { signal, cache: "no-store" });

      return parseHttpResponse<AcademicLevel[]>(response, ENROLLMENT_MESSAGES.PERIOD_SCOPE_LOAD_FAILED);
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const levels = query.data;

  const error = query.isError && !query.isFetching ? ENROLLMENT_MESSAGES.PERIOD_SCOPE_LOAD_FAILED : undefined;

  function renderLevels(): ReactElement | null {
    if (error) {
      return (
        <div className="px-4 py-5">
          <Alert variant="destructive">
            <AlertDescription>
              {error}{" "}
              <Button type="button" variant="link" onClick={() => void query.refetch()}>
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    if (query.isFetching || !levels) {
      return (
        <div role="status" className="grid gap-3 p-4">
          <Skeleton className="h-4 w-32" aria-hidden="true" />
          <Skeleton className="h-10 w-full" aria-hidden="true" />
          <span className="sr-only">Cargando niveles</span>
        </div>
      );
    }

    return (
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
    );
  }

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
      {renderLevels()}
    </article>
  );
}
