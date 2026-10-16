"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";

import { CircleAlertIcon, ScrollTextIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Skeleton } from "@common/components/ui/skeleton";

import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import { fetchStudentGradesClient } from "@features/course-enrollments/services/course-enrollment-grade-client.service";
import type { CourseEnrollmentStudentGrade } from "@features/course-enrollments/types/course-enrollment-student-grade.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import { formatGradeValue } from "@features/course-enrollments/utils/course-enrollment-grade-format.util";

type StudentGradeDialogProps = {
  enrollment: CourseEnrollment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StudentGradeDialog({ enrollment, open, onOpenChange }: StudentGradeDialogProps): ReactElement {
  const [grades, setGrades] = useState<CourseEnrollmentStudentGrade[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    fetchStudentGradesClient(enrollment.id)
      .then((data) => {
        if (!cancelled) {
          setGrades(data);
          setLoadError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, enrollment.id]);

  async function handleRetry(): Promise<void> {
    setIsLoading(true);
    setLoadError(null);

    try {
      setGrades(await fetchStudentGradesClient(enrollment.id));
    } catch {
      setLoadError(COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED);
    } finally {
      setIsLoading(false);
    }
  }

  if (!open) {
    return <></>;
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2.5rem)] max-w-[calc(100%_-_2.5rem)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{COURSE_ENROLLMENT_GRADE_MESSAGES.STUDENT_DIALOG_TITLE}</DialogTitle>
            <DialogDescription>
              {enrollment.academicSpaceName} · {enrollment.courseClassLabel}
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    );
  }

  if (loadError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2.5rem)] max-w-[calc(100%_-_2.5rem)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{COURSE_ENROLLMENT_GRADE_MESSAGES.STUDENT_DIALOG_TITLE}</DialogTitle>
            <DialogDescription>
              {enrollment.academicSpaceName} · {enrollment.courseClassLabel}
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button type="button" onClick={() => void handleRetry()}>
              Reintentar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (grades.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2.5rem)] max-w-[calc(100%_-_2.5rem)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{COURSE_ENROLLMENT_GRADE_MESSAGES.STUDENT_DIALOG_TITLE}</DialogTitle>
            <DialogDescription>
              {enrollment.academicSpaceName} · {enrollment.courseClassLabel}
            </DialogDescription>
          </DialogHeader>
          <Empty className="min-h-56 p-6">
            <EmptyHeader className="max-w-sm">
              <EmptyMedia variant="icon">
                <ScrollTextIcon className="size-5" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-base">Todavía no hay notas</EmptyTitle>
              <EmptyDescription>{COURSE_ENROLLMENT_GRADE_MESSAGES.NO_PUBLISHED_GRADES}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2.5rem)] max-w-[calc(100%_-_2.5rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{COURSE_ENROLLMENT_GRADE_MESSAGES.STUDENT_DIALOG_TITLE}</DialogTitle>
          <DialogDescription>
            {enrollment.academicSpaceName} · {enrollment.courseClassLabel}
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {grades.map((grade) => (
            <li key={grade.id} className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
              <span className="min-w-0 font-medium wrap-break-word">{grade.evaluation}</span>
              <span className="bg-muted shrink-0 rounded-md px-3 py-1.5 font-semibold tabular-nums">{formatGradeValue(grade.value)}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
