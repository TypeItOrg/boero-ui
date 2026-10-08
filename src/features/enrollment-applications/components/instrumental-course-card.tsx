"use client";

import { useCallback, type ReactElement } from "react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Checkbox } from "@common/components/ui/checkbox";
import { FieldLabel } from "@common/components/ui/field";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { cn } from "@common/utils/cn.util";

import { CourseHeading, CourseWarnings } from "@features/enrollment-applications/components/enrollment-course-heading";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { fetchEnrollmentCourses } from "@features/enrollment-applications/services/enrollment-spaces-client.service";
import type { EnrollmentApplicationCourse } from "@features/enrollment-applications/types/enrollment-application-course.types";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";
import { enrollmentCourseGroupKey } from "@features/enrollment-applications/utils/enrollment-course-group.util";

export function InstrumentalCourseCard({
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
}): ReactElement {
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

      return {
        items: page.items,
        nextPage: page.page + 1 < page.totalPages ? page.page + 1 : null,
      };
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
