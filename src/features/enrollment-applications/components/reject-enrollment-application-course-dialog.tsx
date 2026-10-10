"use client";

import { useActionState, type ReactElement } from "react";

import { CircleAlertIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { Button } from "@common/components/ui/button";
import { Field, FieldLabel } from "@common/components/ui/field";
import { Textarea } from "@common/components/ui/textarea";
import { safelyRunAction } from "@common/utils/safe-action.util";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";
import { rejectApplicationCourseAction } from "@features/course-enrollments/actions/course-enrollment.actions";
import { rejectPlatformApplicationCourseAction } from "@features/course-enrollments/actions/platform-course-enrollment.actions";
import { COURSE_ENROLLMENT_MESSAGES } from "@features/course-enrollments/constants/course-enrollment.constants";
import { type EnrollmentApplicationCourseDialogProps } from "@features/enrollment-applications/types/enrollment-application-course-dialog-props.types";

export function RejectEnrollmentApplicationCourseDialog({
  applicationId,
  institutionId,
  scope = AcademicScope.INSTITUTIONAL,
  course,
  open,
  onOpenChange,
  onResolved,
}: EnrollmentApplicationCourseDialogProps): ReactElement {
  const [state, formAction, isPending] = useActionState(async (_previous: { error?: string }, formData: FormData) => {
    const reason = formData.get("reason");

    const normalizedReason = typeof reason === "string" ? reason : "";

    const result = await safelyRunAction(
      scope === AcademicScope.ADMIN && institutionId
        ? rejectPlatformApplicationCourseAction(institutionId, applicationId, course.applicationCourseId, course.version, normalizedReason)
        : rejectApplicationCourseAction(applicationId, course.applicationCourseId, course.version, normalizedReason),
      COURSE_ENROLLMENT_MESSAGES.MUTATION_UNAVAILABLE,
    );

    if (!result.error) {
      onOpenChange(false);
      onResolved();
    }

    return result;
  }, {});

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => (!isPending ? onOpenChange(nextOpen) : undefined)}>
      <AlertDialogContent>
        <ActionForm action={formAction} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar solicitud de cursada</AlertDialogTitle>
            <AlertDialogDescription>
              {course.academicSpaceName} · {course.academicYear ? `Ciclo ${course.academicYear} · ` : ""}Plan {formatStudyPlanName(course)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {state.error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <Field>
            <FieldLabel htmlFor="reason" required>
              Motivo
            </FieldLabel>
            <Textarea id="reason" name="reason" maxLength={1000} required disabled={isPending} />
          </Field>
          <AlertDialogFooter>
            <Button type="button" variant="outline" size="lg" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" variant="destructive" disabled={isPending}>
              {isPending ? "Rechazando…" : "Rechazar solicitud"}
            </Button>
          </AlertDialogFooter>
        </ActionForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}
