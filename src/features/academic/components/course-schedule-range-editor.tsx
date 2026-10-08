"use client";

import type { ReactElement } from "react";

import { Trash2Icon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { TimeInputWithIcon } from "@common/components/ui/time-input-with-icon";

import { type ScheduleDraft } from "@features/academic/types/course-schedule-draft.types";
import { parsePositiveInt, toMinutes } from "@features/academic/utils/course-form-draft.util";

export function ScheduleRangeEditor({
  canRemove,
  dayLabel,
  index,
  individual,
  onEndTimeChange,
  onRemove,
  onStartTimeChange,
  periodDurationMinutes,
  schedule,
  scheduleError,
}: ScheduleRangeEditorProps): ReactElement {
  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);
  const isEmpty = !schedule.startTime && !schedule.endTime;
  const isIncomplete = !schedule.startTime || !schedule.endTime;
  const isValid = !isIncomplete && start >= 0 && end >= 0 && start < end;
  const duration = isValid ? end - start : 0;
  const period = parsePositiveInt(periodDurationMinutes);
  const isDivisible = Boolean(period && duration % period === 0);

  return (
    <div className="bg-background rounded-xl border p-4 shadow-2xs">
      <div className="mb-3.5 flex min-h-8 flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold">Franja {index + 1}</span>
          {!isEmpty && !isValid ? <Badge variant="destructive">{isIncomplete ? "Incompleta" : "Inválida"}</Badge> : null}
          {isValid ? <Badge variant="outline">{duration} min</Badge> : null}
          {individual && isValid && period ? (
            <Badge variant={isDivisible ? "success" : "destructive"}>
              {isDivisible ? `${duration / period} ${duration === period ? "cupo" : "cupos"}` : "No divisible"}
            </Badge>
          ) : null}
        </div>
        {canRemove ? (
          <Button
            aria-label={`Quitar franja ${index + 1} de ${dayLabel}`}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8"
            onClick={onRemove}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Trash2Icon />
          </Button>
        ) : null}
      </div>

      <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field className="min-w-0" data-invalid={Boolean(scheduleError)}>
          <FieldLabel htmlFor={`schedule-${dayLabel}-${index}-start`}>Hora de inicio</FieldLabel>
          <TimeInputWithIcon
            aria-invalid={Boolean(scheduleError)}
            aria-label={`Inicio ${dayLabel} ${index + 1}`}
            id={`schedule-${dayLabel}-${index}-start`}
            onValueChange={onStartTimeChange}
            value={schedule.startTime}
          />
        </Field>
        <Field className="min-w-0" data-invalid={Boolean(scheduleError)}>
          <FieldLabel htmlFor={`schedule-${dayLabel}-${index}-end`}>Hora de fin</FieldLabel>
          <TimeInputWithIcon
            aria-invalid={Boolean(scheduleError)}
            aria-label={`Fin ${dayLabel} ${index + 1}`}
            id={`schedule-${dayLabel}-${index}-end`}
            onValueChange={onEndTimeChange}
            value={schedule.endTime}
          />
        </Field>
      </FieldGroup>
      {scheduleError ? <p className="text-destructive mt-2 text-xs">{scheduleError}</p> : null}
    </div>
  );
}

export type ScheduleRangeEditorProps = {
  canRemove: boolean;
  dayLabel: string;
  index: number;
  individual: boolean;
  onEndTimeChange: (value: string) => void;
  onRemove: () => void;
  onStartTimeChange: (value: string) => void;
  periodDurationMinutes: string;
  schedule: ScheduleDraft;
  scheduleError: string | undefined;
};
