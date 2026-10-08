"use client";

import type { ReactElement } from "react";

import { CalendarClockIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { cn } from "@common/utils/cn.util";

import { COURSE_DAY_LABELS } from "@features/course-enrollments/constants/course-enrollment.constants";
import type { CourseEnrollmentScheduleFieldsProps } from "@features/course-enrollments/types/course-enrollment-schedule-fields-props.types";
import { formatTime } from "@features/course-enrollments/utils/course-enrollment-time.util";

export function CourseEnrollmentScheduleFields({
  options,
  selectedClass,
  checkedDays,
  daySelections,
  invalidDaySet,
  disabled,
  handleDayToggle,
  handleScheduleChange,
  handleSlotChange,
}: CourseEnrollmentScheduleFieldsProps): ReactElement {
  return (
    <section aria-labelledby="manual-enrollment-schedule-title" className="bg-muted/25 min-w-0 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={CalendarClockIcon}
          title="Días y horarios"
          description={options.format === "INDIVIDUAL" ? "Seleccioná un período por cada día elegido." : "Seleccioná como mínimo un día de la clase."}
          titleId="manual-enrollment-schedule-title"
        />
      </header>

      <div className="mt-5 grid min-w-0 gap-3">
        {selectedClass?.days.map((day) => {
          const checked = checkedDays.includes(day.id);

          const selection = daySelections[day.id];

          const selectedSchedule = day.schedules.find((schedule) => schedule.id === selection?.classScheduleId);

          const invalid = invalidDaySet.has(day.id);

          return (
            <div key={day.id} className={cn("bg-background min-w-0 overflow-hidden rounded-xl border", invalid && "border-destructive")}>
              <Field orientation="horizontal" className={cn("min-w-0 gap-3 p-4 transition-colors", checked && "bg-primary/5")} data-invalid={invalid}>
                <Checkbox
                  id={`day-${day.id}`}
                  className="self-center"
                  checked={checked}
                  disabled={disabled || day.availableCapacity === 0}
                  onCheckedChange={(value) => handleDayToggle(day.id, value === true)}
                />
                <FieldLabel htmlFor={`day-${day.id}`} className="mb-px min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 sm:flex-row">
                  <span className="font-medium">{COURSE_DAY_LABELS[day.dayOfWeek] ?? day.dayOfWeek}</span>
                  {day.capacity !== null ? (
                    <span className="text-muted-foreground shrink-0 text-xs font-normal">
                      {day.availableCapacity ?? day.capacity} cupos disponibles
                    </span>
                  ) : null}
                </FieldLabel>
              </Field>

              {checked ? (
                <div className={cn("grid min-w-0 gap-4 border-t p-4", options.format === "INDIVIDUAL" && "sm:grid-cols-2")}>
                  <Field className="min-w-0" data-invalid={invalid}>
                    <FieldLabel htmlFor={`schedule-${day.id}`} required>
                      Horario
                    </FieldLabel>
                    <Select
                      value={selection?.classScheduleId ?? ""}
                      onValueChange={(value) => handleScheduleChange(day.id, value)}
                      disabled={disabled}
                    >
                      <SelectTrigger
                        id={`schedule-${day.id}`}
                        aria-invalid={invalid}
                        className="h-9! w-full min-w-0 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
                      >
                        <SelectValue placeholder="Seleccioná un horario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {day.schedules.map((schedule) => (
                            <SelectItem key={schedule.id} value={schedule.id} className="px-2.5 py-1.5">
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {invalid && !selection?.classScheduleId ? <FieldError errors={[{ message: "Completá el horario de este día." }]} /> : null}
                  </Field>

                  {options.format === "INDIVIDUAL" ? (
                    <Field className="min-w-0" data-invalid={invalid}>
                      <FieldLabel htmlFor={`slot-${day.id}`} required>
                        Período individual
                      </FieldLabel>
                      <Select
                        value={selection?.individualSlotId ?? ""}
                        onValueChange={(value) => handleSlotChange(day.id, value)}
                        disabled={disabled || !selectedSchedule}
                      >
                        <SelectTrigger
                          id={`slot-${day.id}`}
                          aria-invalid={invalid}
                          className="h-9! w-full min-w-0 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
                        >
                          <SelectValue placeholder={selectedSchedule ? "Seleccionar período" : "Primero, elegí un horario"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {selectedSchedule?.individualSlots.map((slot) => (
                              <SelectItem key={slot.id} value={slot.id} disabled={slot.available === false} className="px-2.5 py-1.5">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                {slot.available === false ? " · Ocupado" : ""}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {invalid && !selection?.individualSlotId ? <FieldError errors={[{ message: "Completá el período de este día." }]} /> : null}
                    </Field>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
