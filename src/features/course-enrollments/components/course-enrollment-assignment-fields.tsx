"use client";

import { useMemo, useState, type ReactElement } from "react";

import { PresentationIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Field, FieldDescription, FieldLabel } from "@common/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";

import { CourseEnrollmentScheduleFields } from "@features/course-enrollments/components/course-enrollment-schedule-fields";
import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";
import { type DaySelection } from "@features/course-enrollments/types/course-enrollment-day-selection.types";

type CourseEnrollmentAssignmentFieldsProps = {
  options: CourseEnrollmentAssignmentOptions;
  disabled?: boolean;
  invalidDayIds?: readonly string[];
};

export function CourseEnrollmentAssignmentFields({
  options,
  disabled = false,
  invalidDayIds = [],
}: CourseEnrollmentAssignmentFieldsProps): ReactElement {
  const [courseClassId, setCourseClassId] = useState(options.classes[0]?.id ?? "");
  const [checkedDays, setCheckedDays] = useState<string[]>([]);
  const [daySelections, setDaySelections] = useState<Record<string, DaySelection>>({});
  const selectedClass = options.classes.find((courseClass) => courseClass.id === courseClassId);
  const invalidDaySet = useMemo(() => new Set(invalidDayIds), [invalidDayIds]);

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
              <SectionHeader
                icon={PresentationIcon}
                title="Clase de cursada"
                description="Elegí el grupo docente al que se incorporará el estudiante."
                titleId="manual-enrollment-class-title"
              />
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
                    {options.classes.map((courseClass) => (
                      <SelectItem key={courseClass.id} value={courseClass.id} className="px-2.5 py-1.5">
                        {courseClass.label}
                        {courseClass.teachers.length > 0 ? ` · ${courseClass.teachers.map((teacher) => teacher.fullName).join(", ")}` : ""}
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

          <CourseEnrollmentScheduleFields
            options={options}
            selectedClass={selectedClass}
            checkedDays={checkedDays}
            daySelections={daySelections}
            invalidDaySet={invalidDaySet}
            disabled={disabled}
            handleDayToggle={handleDayToggle}
            handleScheduleChange={handleScheduleChange}
            handleSlotChange={handleSlotChange}
          />
        </>
      )}
    </div>
  );
}
