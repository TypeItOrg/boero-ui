"use client";

import type { ReactElement } from "react";

import { CalendarDaysIcon, PlusIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { NumericInput } from "@common/components/ui/restricted-input";
import { cn } from "@common/utils/cn.util";

import { FormField } from "@features/academic/components/academic-form-controls";
import { ScheduleRangeEditor } from "@features/academic/components/course-schedule-range-editor";
import { WEEK_DAY_LABELS } from "@features/academic/constants/course-week-day-labels.constants";
import { type DayDraft } from "@features/academic/types/course-day-draft.types";
import { type ScheduleDraft } from "@features/academic/types/course-schedule-draft.types";
import { getCourseDayError, getCourseScheduleError } from "@features/academic/utils/course-day-validation.util";
import { emptySchedule } from "@features/academic/utils/course-form-draft.util";

export function DayEditor({
  day,
  fieldErrors,
  individual,
  onUpdate,
}: {
  day: DayDraft;
  fieldErrors?: Record<string, string>;
  individual: boolean;
  onUpdate: (updater: (draft: DayDraft) => DayDraft) => void;
}): ReactElement {
  const hasSubmitted = Boolean(fieldErrors?.classes);

  const periodError =
    hasSubmitted && individual && (!day.periodDurationMinutes || Number(day.periodDurationMinutes) <= 0)
      ? Number(day.periodDurationMinutes) <= 0 && day.periodDurationMinutes !== ""
        ? "La duración del período debe ser mayor a 0."
        : "Indicá la duración de cada período para los espacios individuales."
      : undefined;

  const capacityError = hasSubmitted && !individual && day.capacity !== "" && Number(day.capacity) <= 0 ? "El cupo debe ser mayor a 0." : undefined;

  // Per-schedule validation helpers
  function getScheduleError(scheduleIndex: number): string | undefined {
    return getCourseScheduleError(day, individual, hasSubmitted, scheduleIndex);
  }

  const dayLevelError = getCourseDayError(day, hasSubmitted, getScheduleError);

  function updateSchedule(scheduleIndex: number, field: keyof ScheduleDraft, value: string): void {
    onUpdate((draft) => ({
      ...draft,
      schedules: draft.schedules.map((candidate, index) => (index === scheduleIndex ? { ...candidate, [field]: value } : candidate)),
    }));
  }

  return (
    <section className="bg-muted/10 overflow-hidden rounded-xl border">
      <header className="bg-muted/25 border-b p-4 sm:p-5">
        <div className="flex items-center gap-3.5">
          <span className="bg-background text-primary flex size-10 items-center justify-center rounded-xl border shadow-xs">
            <CalendarDaysIcon className="size-5" />
          </span>
          <div>
            <h5 className="text-base font-semibold">{WEEK_DAY_LABELS[day.dayOfWeek]}</h5>
            <p className="text-muted-foreground text-sm">
              {day.schedules.length} {day.schedules.length === 1 ? "franja horaria" : "franjas horarias"}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-4 sm:p-5">
        {individual ? (
          <FormField
            label="Duración del período"
            name={`period-${day.dayOfWeek}`}
            error={periodError}
            className="w-full flex-none self-stretch"
            required
          >
            <div
              className={cn(
                "border-input bg-background focus-within:border-ring focus-within:ring-ring/50 flex h-9 w-full items-center overflow-hidden rounded-lg border shadow-2xs transition focus-within:ring-3",
                periodError && "border-destructive ring-destructive/20",
              )}
            >
              <NumericInput
                aria-invalid={Boolean(periodError)}
                aria-label={`Duración del período en minutos para ${WEEK_DAY_LABELS[day.dayOfWeek]}`}
                className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm tabular-nums shadow-none focus-visible:ring-0"
                id={`period-${day.dayOfWeek}`}
                maxLength={4}
                onChange={(event) => {
                  const nextValue = event.currentTarget.value;

                  onUpdate((draft) => ({ ...draft, periodDurationMinutes: nextValue }));
                }}
                value={day.periodDurationMinutes}
              />
              <span className="bg-muted/40 text-muted-foreground flex h-full shrink-0 items-center border-l px-3 text-xs font-medium select-none">
                minutos
              </span>
            </div>
          </FormField>
        ) : (
          <FormField className="w-full flex-[1_0_100%]" label="Cupo (opcional)" name={`capacity-${day.dayOfWeek}`} error={capacityError}>
            <NumericInput
              aria-invalid={Boolean(capacityError)}
              className="bg-background h-9 w-full"
              id={`capacity-${day.dayOfWeek}`}
              maxLength={5}
              onChange={(event) => {
                const nextValue = event.currentTarget.value;

                onUpdate((draft) => ({ ...draft, capacity: nextValue }));
              }}
              placeholder="Sin límite"
              value={day.capacity}
            />
          </FormField>
        )}
        <FormField label="Franjas horarias" name={`schedules-${day.dayOfWeek}`} error={dayLevelError} required className="w-full">
          <div className="flex flex-col gap-3.5 pt-1">
            {day.schedules.map((schedule, index) => {
              const scheduleError = getScheduleError(index);

              return (
                <ScheduleRangeEditor
                  canRemove={day.schedules.length > 1}
                  dayLabel={WEEK_DAY_LABELS[day.dayOfWeek]}
                  index={index}
                  individual={individual}
                  key={index}
                  onEndTimeChange={(value) => updateSchedule(index, "endTime", value)}
                  onRemove={() =>
                    onUpdate((draft) => ({
                      ...draft,
                      schedules: draft.schedules.filter((_, scheduleIndex) => scheduleIndex !== index),
                    }))
                  }
                  onStartTimeChange={(value) => updateSchedule(index, "startTime", value)}
                  periodDurationMinutes={day.periodDurationMinutes}
                  schedule={schedule}
                  scheduleError={scheduleError}
                />
              );
            })}
            <Button
              className="bg-primary/5 text-primary/80 hover:bg-primary/10 hover:text-primary h-10 w-full rounded-lg border-0 font-medium transition-colors"
              onClick={() =>
                onUpdate((draft) => ({
                  ...draft,
                  schedules: [...draft.schedules, emptySchedule()],
                }))
              }
              type="button"
              variant="ghost"
            >
              <PlusIcon data-icon="inline-start" /> Agregar otra franja horaria
            </Button>
          </div>
        </FormField>
      </div>
    </section>
  );
}
