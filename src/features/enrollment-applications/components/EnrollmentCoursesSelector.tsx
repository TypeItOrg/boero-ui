"use client";

import type { ReactElement } from "react";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { cn } from "@common/utils/cn.util";

import { formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";
import { CourseHeading, CourseWarnings } from "@features/enrollment-applications/components/enrollment-course-heading";
import { InstrumentalCourseCard } from "@features/enrollment-applications/components/instrumental-course-card";
import type { EnrollmentApplicationCourse } from "@features/enrollment-applications/types/enrollment-application-course.types";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";
import { enrollmentCourseGroupKey } from "@features/enrollment-applications/utils/enrollment-course-group.util";

type EnrollmentCoursesSelectorProps = {
  applicationId: string;
  courses: readonly EnrollmentCourseOption[];
  selectedCourseIds: readonly string[];
  savedCourses: readonly EnrollmentApplicationCourse[];
  onToggleCourse: (courseId: string, checked: boolean) => void;
  onSelectInstrument: (course: EnrollmentCourseOption) => void;
  pendingInstrumentGroups: readonly string[];
  invalidInstrumentGroups: readonly string[];
  onToggleInstrumentGroup: (course: EnrollmentCourseOption, checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
};

export function EnrollmentCoursesSelector({
  applicationId,
  courses,
  selectedCourseIds,
  savedCourses,
  onToggleCourse,
  onSelectInstrument,
  pendingInstrumentGroups,
  invalidInstrumentGroups,
  onToggleInstrumentGroup,
  disabled = false,
  error,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: EnrollmentCoursesSelectorProps): ReactElement {
  const plans = new Map<string, Map<string, EnrollmentCourseOption[]>>();

  for (const course of courses) {
    const planKey = JSON.stringify([course.studyPlanName, course.studyPlanVersion, course.academicYear]);
    const groups = plans.get(planKey) ?? new Map<string, EnrollmentCourseOption[]>();
    const key = course.instrumental ? enrollmentCourseGroupKey(course) : course.courseId;
    const group = groups.get(key) ?? [];

    if (!group.some((item) => item.courseId === course.courseId)) {
      group.push(course);
    }

    groups.set(key, group);
    plans.set(planKey, groups);
  }

  return (
    <div className="@container space-y-4">
      {[...plans.entries()].map(([planKey, groups]) => {
        const plan = [...groups.values()][0][0];
        const levels = new Map<string, Map<string, EnrollmentCourseOption[]>>();

        for (const [key, variants] of groups) {
          const levelName = variants[0].academicLevelName ?? "Sin nivel";
          const level = levels.get(levelName) ?? new Map<string, EnrollmentCourseOption[]>();
          level.set(key, variants);
          levels.set(levelName, level);
        }

        return (
          <section
            key={planKey}
            aria-label={`${formatStudyPlanName(plan)} · Ciclo ${plan.academicYear}`}
            className="bg-background overflow-hidden rounded-xl border"
          >
            <header className="bg-muted/40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-1">
              <details className="group/plan min-w-0">
                <summary className="focus-visible:ring-ring flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-sm outline-none focus-visible:ring-2 [&::-webkit-details-marker]:hidden">
                  <h3 className="min-w-0 flex-1 truncate text-sm leading-6 font-semibold group-open/plan:break-words group-open/plan:whitespace-normal">
                    {formatStudyPlanName(plan)}
                  </h3>
                  <ChevronDownIcon aria-hidden="true" className="text-muted-foreground size-4 shrink-0 group-open/plan:rotate-180" />
                </summary>
              </details>
              <p className="text-muted-foreground text-xs leading-6">Ciclo {plan.academicYear}</p>
            </header>
            {[...levels.entries()].map(([levelName, levelGroups]) => (
              <section key={levelName} aria-label={levelName} className="not-first:border-t">
                <h4 className="bg-muted/20 border-b px-4 py-2 text-xs font-semibold">{levelName}</h4>
                <div className="divide-y">
                  {[...levelGroups.entries()].map(([key, variants]) => {
                    const course = variants[0];

                    if (course.instrumental) {
                      return (
                        <InstrumentalCourseCard
                          key={key}
                          applicationId={applicationId}
                          variants={variants}
                          savedCourses={savedCourses}
                          selectedCourseIds={selectedCourseIds}
                          disabled={disabled}
                          onSelect={onSelectInstrument}
                          pending={pendingInstrumentGroups.includes(key)}
                          showError={invalidInstrumentGroups.includes(key)}
                          onToggle={(checked) => onToggleInstrumentGroup(course, checked)}
                        />
                      );
                    }

                    const checked = selectedCourseIds.includes(course.courseId);

                    return (
                      <div key={key} className={cn("transition-colors", checked ? "bg-primary/[0.035]" : "hover:bg-muted/20")}>
                        <div className="flex items-center gap-3 p-4">
                          <Checkbox
                            id={`course-${course.courseId}`}
                            className="size-5 shrink-0"
                            checked={checked}
                            disabled={disabled || (!checked && course.eligibility?.eligible === false)}
                            onCheckedChange={(value) => onToggleCourse(course.courseId, value === true)}
                          />
                          <CourseHeading course={course} labelId={`course-${course.courseId}`} />
                        </div>
                        {(checked && !course.hasCapacity) || course.eligibility?.eligible === false ? (
                          <div className="pr-4 pb-4 pl-12">
                            <CourseWarnings course={course} />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </section>
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
