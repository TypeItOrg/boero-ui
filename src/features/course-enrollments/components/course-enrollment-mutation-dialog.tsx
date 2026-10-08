"use client";

import { useActionState, type ReactElement } from "react";

import { AlertDialog, AlertDialogContent } from "@common/components/ui/alert-dialog";
import { safelyRunAction } from "@common/utils/safe-action.util";

import { updateCourseAcademicStatusAction, withdrawCourseEnrollmentAction } from "@features/course-enrollments/actions/course-enrollment.actions";
import { CourseEnrollmentMutationFields } from "@features/course-enrollments/components/course-enrollment-mutation-fields";
import { ACADEMIC_ENROLLMENT_STATUS_LABELS, COURSE_ENROLLMENT_MESSAGES } from "@features/course-enrollments/constants/course-enrollment.constants";
import { ACADEMIC_ENROLLMENT_STATUS } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";

type CourseEnrollmentMutationDialogProps = {
  enrollment: CourseEnrollment;
  mode: "withdraw" | "academic";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

const ACADEMIC_STATUS_OPTIONS = [
  ACADEMIC_ENROLLMENT_STATUS.REGULARIZED,
  ACADEMIC_ENROLLMENT_STATUS.PROMOTED,
  ACADEMIC_ENROLLMENT_STATUS.PASSED,
  ACADEMIC_ENROLLMENT_STATUS.FAILED,
].map((value) => ({
  value,
  label: ACADEMIC_ENROLLMENT_STATUS_LABELS[value],
}));

export function CourseEnrollmentMutationDialog({
  enrollment,
  mode,
  open,
  onOpenChange,
  onUpdated,
}: CourseEnrollmentMutationDialogProps): ReactElement {
  const [state, formAction, isPending] = useActionState(async (_previous: { error?: string }, formData: FormData) => {
    const reason = formData.get("reason");

    if (typeof reason !== "string" || !reason.trim()) {
      return { error: "Debés indicar el motivo de la operación." };
    }

    const result = await safelyRunAction(
      mode === "withdraw"
        ? withdrawCourseEnrollmentAction(
            enrollment.id,
            formData.get("type") === "VOLUNTARY" ? "VOLUNTARY" : "ADMINISTRATIVE",
            reason,
            enrollment.version,
          )
        : updateCourseAcademicStatusAction(enrollment.id, String(formData.get("status") ?? ""), reason, enrollment.version),
      COURSE_ENROLLMENT_MESSAGES.MUTATION_UNAVAILABLE,
    );

    if (!result.error) {
      onOpenChange(false);
      onUpdated();
    }

    return result;
  }, {});

  function handleOpenChange(nextOpen: boolean): void {
    if (isPending && !nextOpen) {
      return;
    }

    onOpenChange(nextOpen);
  }

  const availableAcademicStatusOptions = ACADEMIC_STATUS_OPTIONS;
  const defaultAcademicStatus = availableAcademicStatusOptions.some((option) => option.value === enrollment.academicStatus)
    ? enrollment.academicStatus
    : undefined;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <CourseEnrollmentMutationFields
          formAction={formAction}
          mode={mode}
          enrollment={enrollment}
          state={state}
          isPending={isPending}
          defaultAcademicStatus={defaultAcademicStatus}
          availableAcademicStatusOptions={availableAcademicStatusOptions}
          onOpenChange={onOpenChange}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
