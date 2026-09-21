"use client";

import * as React from "react";
import { COURSE_DAY_LABELS } from "@features/course-enrollments/constants/course-enrollment.constants";
import { CalendarClockIcon, PresentationIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@common/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { cn } from "@common/utils/cn.util";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";

type CourseEnrollmentAssignmentFieldsProps = {
  options: CourseEnrollmentAssignmentOptions;
  disabled?: boolean;
  invalidDayIds?: readonly string[];
};

type DaySelection = {
  classScheduleId: string;
  individualSlotId: string | null;
};

export function CourseEnrollmentAssignmentFields({
  options,
  disabled = false,
  invalidDayIds = [],
}: CourseEnrollmentAssignmentFieldsProps): React.ReactElement {
  const [courseClassId, setCourseClassId] = React.useState(options.classes[0]?.id ?? "");
  const [checkedDays, setCheckedDays] = React.useState<string[]>([]);
  const [daySelections, setDaySelections] = React.useState<Record<string, DaySelection>>({});
  const selectedClass = options.classes.find((courseClass) => courseClass.id === courseClassId);
  const invalidDaySet = React.useMemo(() => new Set(invalidDayIds), [invalidDayIds]);
  const assignments = checkedDays.map((dayId) => ({
    dayId,
    ...(daySelections[dayId] ?? { classScheduleId: "", individualSlotId: null }),
  }));

  function handleClassChange(nextClassId: string): void {
    setCourseClassId(nextClassId);
    setCheckedDays([]);
    setDaySelections({});
  }

  function handleDayToggle(dayId: string, checked: boolean): void {
    setCheckedDays((previous) => (checked ? [...previous, dayId] : previous.filter((id) => id !== dayId)));
    setDaySelections((previous) => {
      if (checked) {
        return previous;
      }

      const next = { ...previous };
      delete next[dayId];
      return next;
    });
  }

  function handleScheduleChange(dayId: string, scheduleId: string): void {
    setCheckedDays((previous) => (previous.includes(dayId) ? previous : [...previous, dayId]));
    setDaySelections((previous) => ({
      ...previous,
      [dayId]: {
        classScheduleId: scheduleId,
        individualSlotId: null,
      },
    }));
  }

  function handleSlotChange(dayId: string, individualSlotId: string): void {
    setDaySelections((previous) => ({
      ...previous,
      [dayId]: {
        ...(previous[dayId] ?? { classScheduleId: "" }),
        individualSlotId,
      },
    }));
  }

  return (
    <div className="grid min-w-0 gap-5">
      <input type="hidden" name="courseClassId" value={courseClassId} />
      <input type="hidden" name="assignments" value={JSON.stringify(assignments)} />

      {options.classes.length === 0 ? (
        <Alert variant="destructive">
          <AlertDescription>El curso no tiene clases configuradas para asignar.</AlertDescription>
        </Alert>
      ) : (
        <>
          <section aria-labelledby="manual-enrollment-class-title" className="bg-muted/25 min-w-0 rounded-xl border p-5 md:p-6">
            <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
              <div className="flex items-center gap-3.5">
                <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                  <PresentationIcon className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 id="manual-enrollment-class-title" className="text-base font-semibold">
                    Clase de cursada
                  </h2>
                  <p className="text-muted-foreground text-sm">Elegí el grupo docente al que se incorporará el estudiante.</p>
                </div>
              </div>
            </header>

            <Field className="mt-5 min-w-0">
              <FieldLabel htmlFor="courseClassId" required>
                Clase
              </FieldLabel>
              <Select value={courseClassId} onValueChange={handleClassChange} disabled={disabled}>
                <SelectTrigger
                  id="courseClassId"
                  className="h-9! w-full min-w-0 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
                >
                  <SelectValue placeholder="Seleccioná una clase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {options.classes.map((courseClass, index) => (
                      <SelectItem key={courseClass.id} value={courseClass.id} className="px-2.5 py-1.5">
                        Clase {index + 1}
                        {courseClass.teachers.length > 0 ? ` — ${courseClass.teachers.map((teacher) => teacher.fullName).join(", ")}` : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {selectedClass && selectedClass.teachers.length > 0 ? (
                <FieldDescription>Docentes: {selectedClass.teachers.map((teacher) => teacher.fullName).join(", ")}.</FieldDescription>
              ) : null}
            </Field>
          </section>

          <section aria-labelledby="manual-enrollment-schedule-title" className="bg-muted/25 min-w-0 rounded-xl border p-5 md:p-6">
            <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
              <div className="flex items-center gap-3.5">
                <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                  <CalendarClockIcon className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 id="manual-enrollment-schedule-title" className="text-base font-semibold">
                    Días y horarios
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {options.format === "INDIVIDUAL" ? "Seleccioná un período por cada día elegido." : "Seleccioná como mínimo un día de la clase."}
                  </p>
                </div>
              </div>
            </header>

            <div className="mt-5 grid min-w-0 gap-3">
              {selectedClass?.days.map((day) => {
                const checked = checkedDays.includes(day.id);
                const selection = daySelections[day.id];
                const selectedSchedule = day.schedules.find((schedule) => schedule.id === selection?.classScheduleId);
                const invalid = invalidDaySet.has(day.id);

                return (
                  <div key={day.id} className={cn("bg-background min-w-0 overflow-hidden rounded-xl border", invalid && "border-destructive")}>
                    <Field
                      orientation="horizontal"
                      className={cn("min-w-0 gap-3 p-4 transition-colors", checked && "bg-primary/5")}
                      data-invalid={invalid}
                    >
                      <Checkbox
                        id={`day-${day.id}`}
                        className="self-center"
                        checked={checked}
                        disabled={disabled || day.availableCapacity === 0}
                        onCheckedChange={(value) => handleDayToggle(day.id, value === true)}
                      />
                      <FieldLabel
                        htmlFor={`day-${day.id}`}
                        className="mb-px min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 sm:flex-row"
                      >
                        <span className="font-medium">{COURSE_DAY_LABELS[day.dayOfWeek] ?? day.dayOfWeek}</span>
                        {day.capacity !== null ? (
                          <span className="text-muted-foreground shrink-0 text-xs font-normal">
                            {day.availableCapacity ?? day.capacity} cupos disponibles
                          </span>
                        ) : null}
                      </FieldLabel>
                    </Field>

                    {checked ? (
                      <div className="grid min-w-0 gap-4 border-t p-4 sm:grid-cols-2">
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
                            {invalid && !selection?.individualSlotId ? (
                              <FieldError errors={[{ message: "Completá el período de este día." }]} />
                            ) : null}
                          </Field>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function formatTime(value: string): string {
  return value.slice(0, 5);
}
