"use client";

import * as React from "react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Field, FieldDescription, FieldLabel } from "@common/components/ui/field";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";

type CourseEnrollmentAssignmentFieldsProps = {
  options: CourseEnrollmentAssignmentOptions;
  disabled?: boolean;
};

type DaySelection = {
  classScheduleId: string;
  individualSlotId: string | null;
};

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export function CourseEnrollmentAssignmentFields({ options, disabled = false }: CourseEnrollmentAssignmentFieldsProps): React.ReactElement {
  const [courseClassId, setCourseClassId] = React.useState(options.classes[0]?.id ?? "");
  const [daySelections, setDaySelections] = React.useState<Record<string, DaySelection>>({});
  const selectedClass = options.classes.find((courseClass) => courseClass.id === courseClassId);
  const assignments = Object.values(daySelections);

  function handleClassChange(nextClassId: string): void {
    setCourseClassId(nextClassId);
    setDaySelections({});
  }

  function handleScheduleChange(dayId: string, scheduleId: string): void {
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
    <div className="grid gap-5">
      <input type="hidden" name="courseClassId" value={courseClassId} />
      <input type="hidden" name="assignments" value={JSON.stringify(assignments)} />

      {options.classes.length === 0 ? (
        <Alert variant="destructive">
          <AlertDescription>El curso no tiene clases configuradas para asignar.</AlertDescription>
        </Alert>
      ) : (
        <>
          <Field>
            <FieldLabel htmlFor="courseClassId" required>
              Clase
            </FieldLabel>
            <select
              id="courseClassId"
              value={courseClassId}
              onChange={(event) => handleClassChange(event.target.value)}
              disabled={disabled}
              required
              className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
            >
              {options.classes.map((courseClass, index) => (
                <option key={courseClass.id} value={courseClass.id}>
                  Clase {index + 1}
                </option>
              ))}
            </select>
            <FieldDescription>Elegí una clase y después los días que se asignarán a la cursada.</FieldDescription>
          </Field>

          <div className="grid gap-4">
            <div>
              <p className="text-sm font-medium">Días y horarios</p>
              <p className="text-muted-foreground text-sm">
                {options.format === "INDIVIDUAL" ? "Seleccioná un período por cada día elegido." : "Seleccioná como mínimo un día de la clase."}
              </p>
            </div>

            {selectedClass?.days.map((day) => {
              const selection = daySelections[day.id];
              const selectedSchedule = day.schedules.find((schedule) => schedule.id === selection?.classScheduleId);

              return (
                <div key={day.id} className="bg-muted/25 grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="font-medium">{DAY_LABELS[day.dayOfWeek] ?? day.dayOfWeek}</p>
                    {day.capacity !== null ? <p className="text-muted-foreground text-xs">Capacidad configurada: {day.capacity}</p> : null}
                  </div>
                  <Field>
                    <FieldLabel htmlFor={`schedule-${day.id}`}>Horario</FieldLabel>
                    <select
                      id={`schedule-${day.id}`}
                      value={selection?.classScheduleId ?? ""}
                      onChange={(event) => handleScheduleChange(day.id, event.target.value)}
                      disabled={disabled}
                      className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
                    >
                      <option value="">No asignar este día</option>
                      {day.schedules.map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                          {formatTime(schedule.startTime)}–{formatTime(schedule.endTime)}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {options.format === "INDIVIDUAL" && selectedSchedule ? (
                    <Field>
                      <FieldLabel htmlFor={`slot-${day.id}`} required>
                        Período individual
                      </FieldLabel>
                      <select
                        id={`slot-${day.id}`}
                        value={selection?.individualSlotId ?? ""}
                        onChange={(event) => handleSlotChange(day.id, event.target.value)}
                        disabled={disabled}
                        required
                        className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
                      >
                        <option value="">Seleccionar período</option>
                        {selectedSchedule.individualSlots.map((slot) => (
                          <option key={slot.id} value={slot.id}>
                            {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                          </option>
                        ))}
                      </select>
                    </Field>
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
