"use client";

import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";
import { Button } from "@common/components/ui/button";

type EnrollmentCoursesSelectorProps = {
  courses: readonly EnrollmentCourseOption[];
  selectedCourseIds: readonly string[];
  onSelectCourse: (courseId: string) => void;
  disabled?: boolean;
  error?: string;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
};

export function EnrollmentCoursesSelector({
  courses,
  selectedCourseIds,
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
        const selected = selectedCourseIds.find((courseId) => options.some((option) => option.courseId === courseId));
        return (
          <fieldset key={studyPlanSpaceId} className="rounded-lg border p-4">
            <legend className="px-1 text-sm font-semibold">
              {options[0]?.academicSpaceName} · {options[0]?.academicLevelName ?? "Sin nivel"}
            </legend>
            <div className="mt-2 grid gap-2">
              {options.map((course) => (
                <label key={course.courseId} className="bg-muted/30 flex cursor-pointer items-start gap-3 rounded-md border p-3">
                  <input
                    type="radio"
                    name={`course-${studyPlanSpaceId}`}
                    checked={selected === course.courseId}
                    disabled={disabled}
                    onChange={() => onSelectCourse(course.courseId)}
                  />
                  <span className="min-w-0 text-sm">
                    <span className="block font-medium">
                      {course.studyPlanName}
                      {course.instrumentName ? ` · ${course.instrumentName}` : ""}
                    </span>
                    <span className="text-muted-foreground block">
                      {course.format === "INDIVIDUAL" ? "Modalidad individual" : "Modalidad grupal"}
                    </span>
                    {!course.hasCapacity ? <span className="text-amber-700">Sin disponibilidad actual; podés solicitarla.</span> : null}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
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
