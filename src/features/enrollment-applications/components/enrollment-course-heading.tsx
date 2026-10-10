"use client";

import type { ReactElement } from "react";

import { UserRoundIcon, UsersRoundIcon } from "lucide-react";

import { FieldLabel } from "@common/components/ui/field";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";

export function CourseHeading({ course, labelId }: { course: EnrollmentCourseOption; labelId: string }): ReactElement {
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

export function CourseWarnings({ course }: { course: EnrollmentCourseOption }): ReactElement {
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
