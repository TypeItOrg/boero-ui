"use client";

import { formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";
import { useCallback } from "react";
import { ChevronDownIcon, UserRoundIcon, UsersRoundIcon } from "lucide-react";
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
      <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-3 p-4 @2xl:grid-cols-[1.25rem_minmax(0,1fr)_18rem]">
        <Checkbox
          id={`course-group-${key}`}
          className="size-5 shrink-0"
          checked={checked}
          disabled={disabled || (!checked && course.eligibility?.eligible === false)}
          aria-controls={`instrument-panel-${key}`}
          aria-expanded={checked}
          onCheckedChange={(value) => onToggle(value === true)}
        />
        <CourseHeading course={course} labelId={`course-group-${key}`} />
        {checked ? (
          <div id={`instrument-panel-${key}`} className="col-start-2 w-full max-w-[18rem] min-w-0 space-y-2 @2xl:col-start-3 @2xl:row-start-1">
            <FieldLabel htmlFor={`instrument-${key}`} required className="sr-only">
              Elegí tu instrumento
            </FieldLabel>
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
              aria-required
              aria-describedby={invalid ? `instrument-error-${key}` : undefined}
              disabled={disabled}
              onValueChange={(_value, item) => {
                if (item && item.eligibility?.eligible !== false) {
                  onSelect(item);
                }
              }}
            />
            {invalid ? (
              <p id={`instrument-error-${key}`} role="alert" className="text-destructive text-sm">
                {ENROLLMENT_MESSAGES.COURSE_INSTRUMENT_REQUIRED}
              </p>
            ) : null}
            {selected.length > 1 ? (
              <p className="text-muted-foreground text-sm">
                Instrumentos guardados: {selected.map((item) => item.instrumentName).join(", ")}. Elegí uno para reemplazarlos.
              </p>
            ) : null}
            {selectedCourse && "periodOpen" in selectedCourse && selectedCourse.periodOpen === false ? (
              <p className="text-destructive text-sm">{ENROLLMENT_MESSAGES.PERIOD_COURSE_CLOSED}</p>
            ) : null}
          </div>
        ) : null}
        {selectedOption?.hasCapacity === false || selectedOption?.eligibility?.eligible === false || course.eligibility?.eligible === false ? (
          <div className="col-start-2 @2xl:col-span-2">
            <CourseWarnings course={selectedOption ?? course} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CourseHeading({ course, labelId }: { course: EnrollmentCourseOption; labelId: string }): React.ReactElement {
  const FormatIcon = course.format === "INDIVIDUAL" ? UserRoundIcon : UsersRoundIcon;

  return (
    <FieldLabel htmlFor={labelId} className="block min-w-0 flex-1 cursor-pointer space-y-1">
      <span className="block text-base leading-snug font-medium break-words">{course.academicSpaceName}</span>
      <span className="sr-only">{course.academicLevelName ?? "Sin nivel"}</span>
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-normal">
        <FormatIcon aria-hidden="true" className="size-3.5 shrink-0" />
        {course.format === "INDIVIDUAL" ? "Individual" : "Grupal"}
      </span>
    </FieldLabel>
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
        <p role="status" className="text-sm text-amber-700 dark:text-amber-400">
          {ENROLLMENT_MESSAGES.NO_CAPACITY_WARNING}
        </p>
      ) : null}
    </>
  );
}
