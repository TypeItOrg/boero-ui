"use client";

import * as React from "react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Skeleton } from "@common/components/ui/skeleton";
import { BookOpenIcon, CircleAlertIcon } from "lucide-react";
import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import { fetchStudentGradesClient } from "@features/course-enrollments/services/course-enrollment-grade-client.service";
import { formatGradeValue } from "@features/course-enrollments/utils/course-enrollment-grade-format.util";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import type { CourseEnrollmentStudentGrade } from "@features/course-enrollments/types/course-enrollment-student-grade.types";

type StudentGradeDialogProps = {
  enrollment: CourseEnrollment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StudentGradeDialog({ enrollment, open, onOpenChange }: StudentGradeDialogProps): React.ReactElement {
  const [grades, setGrades] = React.useState<CourseEnrollmentStudentGrade[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    fetchStudentGradesClient(enrollment.id)
      .then((data) => setGrades(data))
      .catch(() => setLoadError(COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED))
      .finally(() => setIsLoading(false));
  }, [open, enrollment.id]);

  if (!open) {
    return <></>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2.5rem)] max-w-[calc(100%-2.5rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{COURSE_ENROLLMENT_GRADE_MESSAGES.STUDENT_DIALOG_TITLE}</DialogTitle>
          <DialogDescription>
            {enrollment.academicSpaceName} · {enrollment.courseClassLabel}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-2" aria-busy="true" aria-label="Cargando notas">
            <span className="sr-only" role="status">
              Cargando notas…
            </span>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-baseline justify-between gap-4 rounded-lg border px-3 py-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : grades.length === 0 ? (
          <Empty className="min-h-56 p-6">
            <EmptyHeader className="max-w-sm">
              <EmptyMedia variant="icon">
                <BookOpenIcon className="size-5" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-base">Todavía no hay notas</EmptyTitle>
              <EmptyDescription>{COURSE_ENROLLMENT_GRADE_MESSAGES.NO_PUBLISHED_GRADES}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="space-y-2">
            {grades.map((grade) => (
              <li key={grade.id} className="flex items-baseline justify-between gap-4 rounded-lg border px-3 py-2">
                <span className="min-w-0 wrap-break-word font-medium">{grade.evaluation}</span>
                <span className="font-semibold tabular-nums">{formatGradeValue(grade.value)}</span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
