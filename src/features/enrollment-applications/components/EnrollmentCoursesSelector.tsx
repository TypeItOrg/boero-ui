"use client";

import { useCallback } from "react";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";
import type { EnrollmentApplicationCourse } from "@features/enrollment-applications/types/enrollment-application-course.types";
import { enrollmentCourseGroupKey } from "@features/enrollment-applications/utils/enrollment-course-group.util";
import { fetchEnrollmentCourses } from "@features/enrollment-applications/services/enrollment-spaces-client.service";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { FieldLabel } from "@common/components/ui/field";
import { cn } from "@common/utils/cn.util";

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
}: EnrollmentCoursesSelectorProps): React.ReactElement {
  const groups = new Map<string, EnrollmentCourseOption[]>();
  for (const course of courses) {
    const key = course.instrumental ? enrollmentCourseGroupKey(course) : course.courseId;
    const group = groups.get(key) ?? [];
    if (!group.some((item) => item.courseId === course.courseId)) {
      group.push(course);
    }
    groups.set(key, group);
  }
  return (
    <div className="@container space-y-4">
      <div className="bg-background divide-y overflow-hidden rounded-xl border">
        {[...groups.entries()].map(([key, variants]) => {
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
              <div className="flex items-start gap-3 p-4 @xl:gap-4 @xl:px-5 @xl:py-5">
                <Checkbox
                  id={`course-${course.courseId}`}
                  className="mt-1 size-5 shrink-0"
                  checked={checked}
                  disabled={disabled || (!checked && course.eligibility?.eligible === false)}
                  onCheckedChange={(value) => onToggleCourse(course.courseId, value === true)}
                />
                <CourseHeading course={course} labelId={`course-${course.courseId}`} />
              </div>
              {checked || course.eligibility?.eligible === false ? (
                <div className="px-4 pb-4 @xl:px-5">
                  <CourseWarnings course={course} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {hasMore && onLoadMore ? (
        <Button type="button" variant="outline" disabled={disabled || loadingMore} onClick={onLoadMore}>
          {loadingMore ? "Cargando cursos…" : "Cargar más cursos"}
        </Button>
      ) : null}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}

function InstrumentalCourseCard({
  applicationId,
  variants,
  savedCourses,
  selectedCourseIds,
  disabled,
  onSelect,
  pending,
  showError,
  onToggle,
}: {
  applicationId: string;
  variants: readonly EnrollmentCourseOption[];
  savedCourses: readonly EnrollmentApplicationCourse[];
  selectedCourseIds: readonly string[];
  disabled: boolean;
  onSelect: (course: EnrollmentCourseOption) => void;
  pending: boolean;
  showError: boolean;
  onToggle: (checked: boolean) => void;
}): React.ReactElement {
  const course = variants[0];
  const key = enrollmentCourseGroupKey(course);
  const knownCourses = [...variants, ...savedCourses.filter((saved) => !variants.some((variant) => variant.courseId === saved.courseId))];
  const selected = knownCourses.filter((item) => enrollmentCourseGroupKey(item) === key && selectedCourseIds.includes(item.courseId));
  const selectedCourse = selected.length === 1 ? selected[0] : undefined;
  const checked = pending || selected.length > 0;
  const missingInstrument = checked && selected.length !== 1;
  const invalid = missingInstrument && showError;
  const selectedOption = variants.find((variant) => variant.courseId === selectedCourse?.courseId);
  const fetchInstruments = useCallback(
    async (input: AsyncDropdownFetchPageInput) => {
      const page = await fetchEnrollmentCourses(applicationId, {
        ...input,
        studyPlanSpaceId: course.studyPlanSpaceId,
        academicYear: course.academicYear,
      });
      return { items: page.items, nextPage: page.page + 1 < page.totalPages ? page.page + 1 : null };
    },
    [applicationId, course.studyPlanSpaceId, course.academicYear],
  );
  return (
    <div className={cn("transition-colors", checked ? "bg-primary/[0.035]" : "hover:bg-muted/20")}>
      <div className="flex items-start gap-3 p-4 @xl:gap-4 @xl:px-5 @xl:py-5">
        <Checkbox
          id={`course-group-${key}`}
          className="mt-1 size-5 shrink-0"
          checked={checked}
          disabled={disabled || (!checked && course.eligibility?.eligible === false)}
          aria-controls={`instrument-panel-${key}`}
          aria-expanded={checked}
          onCheckedChange={(value) => onToggle(value === true)}
        />
        <CourseHeading course={course} labelId={`course-group-${key}`} />
      </div>
      {!checked && course.eligibility?.eligible === false ? (
        <div className="px-4 pb-4 @xl:px-5">
          <CourseWarnings course={course} />
        </div>
      ) : null}
      {checked ? (
        <div id={`instrument-panel-${key}`} className="border-primary/10 border-t px-4 py-4 @xl:px-5 @xl:py-5">
          <div className="grid items-start gap-4 @xl:grid-cols-[minmax(0,1fr)_minmax(16rem,1fr)] @xl:gap-8">
            <div className="space-y-1">
              <FieldLabel htmlFor={`instrument-${key}`} required className="font-medium">
                Elegí tu instrumento
              </FieldLabel>
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">{ENROLLMENT_MESSAGES.COURSE_INSTRUMENT_HINT}</p>
            </div>
            <div className="min-w-0 space-y-2">
              <AsyncDropdown<EnrollmentCourseOption>
                id={`instrument-${key}`}
                value={selectedCourse?.courseId ?? ""}
                selectedLabel={selectedCourse?.instrumentName ?? undefined}
                fetchPage={fetchInstruments}
                queryKey={["enrollment-course-instruments", applicationId, key]}
                getItemValue={(item) => item.courseId}
                getItemLabel={(item) => `${item.instrumentName ?? "Instrumento"}${item.hasCapacity ? "" : " · Sin cupo"}`}
                placeholder="Seleccioná un instrumento"
                searchPlaceholder="Buscar instrumento…"
                emptyMessage="No hay instrumentos disponibles para este curso."
                errorMessage={ENROLLMENT_MESSAGES.FETCH_COURSES_FAILED}
                ariaInvalid={invalid}
                disabled={disabled}
                onValueChange={(_value, item) => {
                  if (item && item.eligibility?.eligible !== false) {
                    onSelect(item);
                  }
                }}
              />
              {invalid ? (
                <p role="alert" className="text-destructive text-sm">
                  {ENROLLMENT_MESSAGES.COURSE_INSTRUMENT_REQUIRED}
                </p>
              ) : null}
            </div>
          </div>
          {selected.length > 1 ? (
            <p className="text-muted-foreground text-sm">
              Instrumentos guardados: {selected.map((item) => item.instrumentName).join(", ")}. Elegí uno para reemplazarlos.
            </p>
          ) : null}
          {selectedCourse && "periodOpen" in selectedCourse && selectedCourse.periodOpen === false ? (
            <p className="text-destructive text-sm">{ENROLLMENT_MESSAGES.PERIOD_COURSE_CLOSED}</p>
          ) : null}
          {selectedOption || course.eligibility?.eligible === false ? <CourseWarnings course={selectedOption ?? course} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function CourseHeading({ course, labelId }: { course: EnrollmentCourseOption; labelId: string }): React.ReactElement {
  return (
    <div className="grid min-w-0 flex-1 gap-4 @xl:grid-cols-[minmax(0,1fr)_16rem] @xl:items-center @xl:gap-6">
      <div className="min-w-0 space-y-2.5">
        <FieldLabel htmlFor={labelId} className="block cursor-pointer text-base leading-snug font-semibold break-words">
          {course.academicSpaceName}
        </FieldLabel>
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
          <span className="bg-muted text-foreground/80 rounded-md px-2 py-1 font-medium">{course.academicLevelName ?? "Sin nivel"}</span>
          <span>{course.format === "INDIVIDUAL" ? "Individual" : "Grupal"}</span>
          {course.instrumental ? (
            <>
              <span aria-hidden="true">·</span>
              <span>Con instrumento</span>
            </>
          ) : null}
        </div>
      </div>
      <dl className="grid min-w-0 grid-cols-2 gap-4 border-t pt-3 @xl:border-t-0 @xl:border-l @xl:pt-0 @xl:pl-6">
        <div className="min-w-0">
          <dt className="text-muted-foreground text-xs">Ciclo lectivo</dt>
          <dd className="mt-1 text-sm font-medium">{course.academicYear}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground text-xs">Plan de estudio</dt>
          <dd className="mt-1 text-sm font-medium break-words">{course.studyPlanName}</dd>
        </div>
      </dl>
    </div>
  );
}

function CourseWarnings({ course }: { course: EnrollmentCourseOption }): React.ReactElement {
  return (
    <>
      {course.eligibility && !course.eligibility.eligible ? (
        <div className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-sm">
          <p className="font-medium">{ENROLLMENT_MESSAGES.ACADEMIC_REQUIREMENTS_PENDING}</p>
          <ul className="mt-1 list-inside list-disc">
            {course.eligibility.requirements
              .filter((item) => !item.satisfied)
              .map((item) => (
                <li key={item.prerequisiteId}>
                  {item.academicSpaceName}: requiere {item.requiredCondition === "PASSED" ? "aprobación" : "regularidad"}.
                </li>
              ))}
          </ul>
          <p className="text-muted-foreground mt-1">
            Este espacio no se puede solicitar hasta que las correlatividades estén cumplidas y registradas.
          </p>
        </div>
      ) : null}
      {!course.hasCapacity ? (
        <p role="status" className="text-sm text-amber-700">
          {ENROLLMENT_MESSAGES.NO_CAPACITY_WARNING}
        </p>
      ) : null}
    </>
  );
}
