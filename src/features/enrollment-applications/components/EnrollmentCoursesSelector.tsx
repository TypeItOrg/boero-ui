"use client";

import type { EnrollmentCourseGroupSelection, EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { approvalModeLabels, requirementTypeLabels } from "@features/academic/utils/academic-labels.util";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { cn } from "@common/utils/cn.util";

type EnrollmentCoursesSelectorProps = {
  courses: readonly EnrollmentCourseOption[];
  selection: readonly EnrollmentCourseGroupSelection[];
  onToggleGroup: (studyPlanSpaceId: string, checked: boolean) => void;
  onSelectInstrument: (studyPlanSpaceId: string, courseId: string) => void;
  onSelectCourse: (studyPlanSpaceId: string, courseId: string) => void;
  disabled?: boolean;
  error?: string;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
};

function formatGroupMeta(option: EnrollmentCourseOption): string {
  const parts = [
    option.academicLevelName ?? "Sin nivel",
    option.requirementType ? requirementTypeLabels[option.requirementType] : undefined,
    option.approvalMode ? approvalModeLabels[option.approvalMode] : undefined,
  ].filter(Boolean);

  if (option.instrumental || option.instrumentId != null) {
    parts.push("Requiere instrumento");
  }

  return parts.join(" · ");
}

export function EnrollmentCoursesSelector({
  courses,
  selection,
  onToggleGroup,
  onSelectInstrument,
  onSelectCourse,
  disabled = false,
  error,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: EnrollmentCoursesSelectorProps): React.ReactElement {
  const groups = new Map<string, EnrollmentCourseOption[]>();
  for (const course of courses) {
    const group = groups.get(course.studyPlanSpaceId) ?? [];
    group.push(course);
    groups.set(course.studyPlanSpaceId, group);
  }

  return (
    <div className="space-y-4">
      {Array.from(groups.entries()).map(([studyPlanSpaceId, options]) => {
        const entry = selection.find((selected) => selected.studyPlanSpaceId === studyPlanSpaceId);
        const checked = entry !== undefined;
        const instrumentalOptions = options.filter((option) => option.instrumentId != null);
        const plainOptions = options.filter((option) => option.instrumentId == null);
        const groupHasCapacity = options.some((option) => option.hasCapacity);
        const selectedOption = options.find((option) => option.courseId === entry?.courseId);
        const showInstrumentError = checked && instrumentalOptions.length > 0 && !entry?.courseId && Boolean(error);

        return (
          <div
            key={studyPlanSpaceId}
            className={cn(
              "rounded-xl border p-4",
              checked ? "border-primary/30 bg-primary/5 dark:border-primary/20 dark:bg-primary/10" : "bg-background",
            )}
          >
            <Field orientation="horizontal" data-disabled={disabled}>
              <Checkbox
                id={`course-group-${studyPlanSpaceId}`}
                checked={checked}
                disabled={disabled}
                onCheckedChange={(value) => onToggleGroup(studyPlanSpaceId, value === true)}
              />
              <div className="min-w-0">
                <FieldLabel htmlFor={`course-group-${studyPlanSpaceId}`} className="block font-medium">
                  {options[0]?.academicSpaceName}
                </FieldLabel>
                <p className="text-muted-foreground mt-0.5 block text-sm">{options[0] ? formatGroupMeta(options[0]) : ""}</p>
              </div>
            </Field>
            {checked && instrumentalOptions.length > 0 ? (
              <Field className="mt-3">
                <FieldLabel htmlFor={`instrument-${studyPlanSpaceId}`} required>
                  Instrumento
                </FieldLabel>
                <Select value={entry?.courseId ?? ""} onValueChange={(value) => onSelectInstrument(studyPlanSpaceId, value)} disabled={disabled}>
                  <SelectTrigger id={`instrument-${studyPlanSpaceId}`} className="h-9! w-full">
                    <SelectValue placeholder="Seleccioná un instrumento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {instrumentalOptions.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId} className="px-2.5 py-1.5">
                          {course.instrumentName ?? course.studyPlanName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {!groupHasCapacity ? <span className="text-sm text-amber-700">Sin disponibilidad actual; podés solicitarla.</span> : null}
                {selectedOption && !selectedOption.hasCapacity ? (
                  <span className="text-sm text-amber-700">El instrumento elegido no tiene disponibilidad actual; podés solicitarlo igual.</span>
                ) : null}
                {showInstrumentError ? <FieldError errors={[{ message: ENROLLMENT_MESSAGES.INSTRUMENT_PER_SPACE_REQUIRED }]} /> : null}
              </Field>
            ) : null}
            {checked && instrumentalOptions.length === 0 && plainOptions.length > 1 ? (
              <div className="mt-3 grid gap-2" role="radiogroup" aria-label={options[0]?.academicSpaceName}>
                {plainOptions.map((course) => (
                  <label key={course.courseId} className="bg-muted/30 flex cursor-pointer items-start gap-3 rounded-md border p-3">
                    <input
                      type="radio"
                      name={`course-${studyPlanSpaceId}`}
                      checked={entry?.courseId === course.courseId}
                      disabled={disabled}
                      onChange={() => onSelectCourse(studyPlanSpaceId, course.courseId)}
                    />
                    <span className="min-w-0 text-sm">
                      <span className="block font-medium">{course.studyPlanName}</span>
                      <span className="text-muted-foreground block">
                        {course.format === "INDIVIDUAL" ? "Modalidad individual" : "Modalidad grupal"}
                      </span>
                      {!course.hasCapacity ? <span className="text-amber-700">Sin disponibilidad actual; podés solicitarla.</span> : null}
                    </span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
      {hasMore && onLoadMore ? (
        <Button type="button" variant="outline" disabled={disabled || loadingMore} onClick={onLoadMore}>
          {loadingMore ? "Cargando cursos…" : "Cargar más cursos"}
        </Button>
      ) : null}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
