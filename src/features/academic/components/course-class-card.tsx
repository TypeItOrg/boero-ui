"use client";

import { useId, type ReactElement } from "react";

import { Trash2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@common/components/ui/toggle-group";

import { FormField } from "@features/academic/components/academic-form-controls";
import { CourseClassTeacherField } from "@features/academic/components/course-class-teacher-field";
import { DayEditor } from "@features/academic/components/course-day-editor";
import { WEEK_DAY_LABELS } from "@features/academic/constants/course-week-day-labels.constants";
import { type ClassDraft } from "@features/academic/types/course-class-draft.types";
import type { CourseWeekDay } from "@features/academic/types/course-week-day.types";
import { COURSE_WEEK_DAY } from "@features/academic/types/course-week-day.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { emptyDay, formatCount, individualFormat } from "@features/academic/utils/course-form-draft.util";

export function ClassCard({ courseClass, fieldErrors, format, institutionId, onRemove, onUpdate, scope, title }: ClassCardProps): ReactElement {
  const teachersFieldId = useId();

  const classSummary = [formatCount(courseClass.teachers.length, "docente", "docentes"), formatCount(courseClass.days.length, "día", "días")].join(
    " · ",
  );

  function updateDays(values: string[]): void {
    const selectedDays = new Set(values.filter((value): value is CourseWeekDay => COURSE_WEEK_DAY.includes(value as CourseWeekDay)));

    onUpdate((draft) => ({
      ...draft,
      days: COURSE_WEEK_DAY.filter((day) => selectedDays.has(day)).map(
        (day) => draft.days.find((candidate) => candidate.dayOfWeek === day) ?? emptyDay(day),
      ),
    }));
  }

  return (
    <Card className="bg-background gap-0 py-0 shadow-xs">
      <CardHeader className="gap-0 border-b px-5 py-3.5 sm:px-6">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">{classSummary}</CardDescription>
        <CardAction className="self-center">
          <Button
            aria-label={`Eliminar ${title.toLowerCase()}`}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8"
            onClick={onRemove}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Trash2Icon />
            <span className="sr-only">Eliminar clase</span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 p-5 sm:p-6">
        {(() => {
          const teacherError = fieldErrors?.classes && courseClass.teachers.length === 0 ? "Seleccioná al menos un docente." : undefined;

          return (
            <CourseClassTeacherField
              teachersFieldId={teachersFieldId}
              teacherError={teacherError}
              courseClass={courseClass}
              onUpdate={onUpdate}
              institutionId={institutionId}
              scope={scope}
            />
          );
        })()}

        {(() => {
          const daysError = fieldErrors?.classes && courseClass.days.length === 0 ? "Seleccioná al menos un día con sus horarios." : undefined;

          return (
            <FormField label="Días de cursado" name={`days-${title}`} error={daysError} required>
              <ToggleGroup
                aria-label="Días de cursado"
                className="mt-1 flex w-full flex-wrap gap-2"
                onValueChange={updateDays}
                size="default"
                spacing={2}
                type="multiple"
                value={courseClass.days.map((day) => day.dayOfWeek)}
                variant="default"
              >
                {COURSE_WEEK_DAY.map((day) => (
                  <ToggleGroupItem
                    className="bg-primary/5 text-primary/80 hover:bg-primary/10 hover:text-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-9 min-w-[4.5rem] flex-1 rounded-lg border-0 px-2 text-sm font-medium transition-colors"
                    key={day}
                    value={day}
                  >
                    {WEEK_DAY_LABELS[day]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FormField>
          );
        })()}

        {courseClass.days.length > 0 ? (
          <div className="flex flex-col gap-4 pt-1">
            {courseClass.days.map((day) => (
              <DayEditor
                day={day}
                fieldErrors={fieldErrors}
                individual={individualFormat(format)}
                key={day.dayOfWeek}
                onUpdate={(updater) =>
                  onUpdate((draft) => ({
                    ...draft,
                    days: draft.days.map((candidate) => (candidate.dayOfWeek === day.dayOfWeek ? updater(candidate) : candidate)),
                  }))
                }
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export type ClassCardProps = {
  courseClass: ClassDraft;
  fieldErrors?: Record<string, string>;
  format: string | undefined;
  institutionId: string | undefined;
  onRemove: () => void;
  onUpdate: (updater: (draft: ClassDraft) => ClassDraft) => void;
  scope: AcademicScope | undefined;
  title: string;
};
