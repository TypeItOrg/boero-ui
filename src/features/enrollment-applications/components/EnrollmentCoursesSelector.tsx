"use client";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldLabel } from "@common/components/ui/field";
import { cn } from "@common/utils/cn.util";

type EnrollmentCoursesSelectorProps = {
  courses: readonly EnrollmentCourseOption[];
  selectedCourseIds: readonly string[];
  onToggleCourse: (courseId: string, checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
};

export function EnrollmentCoursesSelector({
  courses,
  selectedCourseIds,
  onToggleCourse,
  disabled = false,
  error,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: EnrollmentCoursesSelectorProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {courses.map((course) => {
        const checked = selectedCourseIds.includes(course.courseId);
        return (
          <div key={course.courseId} className={cn("rounded-xl border p-4", checked ? "border-primary/30 bg-primary/5" : "bg-background")}>
            <Field orientation="horizontal" data-disabled={disabled}>
              <Checkbox
                id={`course-${course.courseId}`}
                checked={checked}
                disabled={disabled}
                onCheckedChange={(value) => onToggleCourse(course.courseId, value === true)}
              />
              <div className="min-w-0">
                <FieldLabel htmlFor={`course-${course.courseId}`} className="block font-medium">
                  {course.academicSpaceName}
                  {course.instrumental ? ` · ${course.instrumentName}` : ""}
                </FieldLabel>
                <p className="text-muted-foreground text-sm">
                  {course.studyPlanName} · {course.academicLevelName ?? "Sin nivel"} · {course.format === "INDIVIDUAL" ? "Individual" : "Grupal"}
                </p>
                {course.instrumental ? <p className="text-muted-foreground text-sm">Instrumento: {course.instrumentName}</p> : null}
                {!course.hasCapacity ? (
                  <p role="status" className="text-sm text-amber-700">
                    {ENROLLMENT_MESSAGES.NO_CAPACITY_WARNING}
                  </p>
                ) : null}
              </div>
            </Field>
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
