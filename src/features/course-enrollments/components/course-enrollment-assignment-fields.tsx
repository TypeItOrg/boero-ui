"use client";

import * as React from "react";
import { COURSE_DAY_LABELS } from "@features/course-enrollments/constants/course-enrollment.constants";

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
          <Field className="min-w-0">
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
                      {courseClass.label ?? `Clase ${index + 1}`}
                      {courseClass.teachers.length > 0 ? ` — ${courseClass.teachers.map((teacher) => teacher.fullName).join(", ")}` : ""}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {selectedClass && selectedClass.teachers.length > 0 ? (
              <p className="text-muted-foreground text-sm">
                Dictan esta clase: {selectedClass.teachers.map((teacher) => teacher.fullName).join(", ")}.
              </p>
            ) : null}
            <FieldDescription>Elegí una clase y después los días que se asignarán a la cursada.</FieldDescription>
          </Field>

          <div className="grid min-w-0 gap-4">
            <div>
              <p className="text-sm font-medium">Días y horarios</p>
              <p className="text-muted-foreground text-sm">
                {options.format === "INDIVIDUAL" ? "Seleccioná un período por cada día elegido." : "Seleccioná como mínimo un día de la clase."}
              </p>
            </div>

            {selectedClass?.days.map((day) => {
              const checked = checkedDays.includes(day.id);
              const selection = daySelections[day.id];
              const selectedSchedule = day.schedules.find((schedule) => schedule.id === selection?.classScheduleId);
              const invalid = invalidDaySet.has(day.id);

              return (
                <div
                  key={day.id}
                  className={cn("bg-muted/25 grid min-w-0 gap-3 rounded-lg border p-4 sm:grid-cols-2", invalid && "border-destructive")}
                >
                  <Field orientation="horizontal" className="sm:col-span-2" data-invalid={invalid}>
                    <Checkbox
                      id={`day-${day.id}`}
                      checked={checked}
                      disabled={disabled || day.availableCapacity === 0}
                      onCheckedChange={(value) => handleDayToggle(day.id, value === true)}
                    />
                    <div>
                      <FieldLabel htmlFor={`day-${day.id}`} className="font-medium">
                        {COURSE_DAY_LABELS[day.dayOfWeek] ?? day.dayOfWeek}
                      </FieldLabel>
                      {day.capacity !== null ? (
                        <p className="text-muted-foreground text-xs">Cupos disponibles: {day.availableCapacity ?? day.capacity}</p>
                      ) : null}
                    </div>
                  </Field>
                  {checked ? (
                    <>
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
                                  {formatTime(schedule.startTime)}–{formatTime(schedule.endTime)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {invalid && !selection?.classScheduleId ? <FieldError errors={[{ message: "Completá el horario de este día." }]} /> : null}
                      </Field>

                      {options.format === "INDIVIDUAL" && selectedSchedule ? (
                        <Field className="min-w-0" data-invalid={invalid}>
                          <FieldLabel htmlFor={`slot-${day.id}`} required>
                            Período individual
                          </FieldLabel>
                          <Select
                            value={selection?.individualSlotId ?? ""}
                            onValueChange={(value) => handleSlotChange(day.id, value)}
                            disabled={disabled}
                          >
                            <SelectTrigger
                              id={`slot-${day.id}`}
                              aria-invalid={invalid}
                              className="h-9! w-full min-w-0 [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
                            >
                              <SelectValue placeholder="Seleccionar período" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {selectedSchedule.individualSlots.map((slot) => (
                                  <SelectItem key={slot.id} value={slot.id} disabled={slot.available === false} className="px-2.5 py-1.5">
                                    {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                                    {slot.available === false ? " · Ocupado" : ""}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {invalid && !selection?.individualSlotId ? <FieldError errors={[{ message: "Completá el período de este día." }]} /> : null}
                        </Field>
                      ) : null}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function formatTime(value: string): string {
  return value.slice(0, 5);
}
