"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";

import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";

import { CourseEnrollmentDeletedGradeItem } from "@features/course-enrollments/components/course-enrollment-deleted-grade-item";
import { CourseEnrollmentGradeListItem } from "@features/course-enrollments/components/course-enrollment-grade-list-item";
import { GradeListEmpty, GradeListSkeleton } from "@features/course-enrollments/components/course-enrollment-grade-list-states";
import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import { fetchManagementGradesClient, fetchTeacherGradesClient } from "@features/course-enrollments/services/course-enrollment-grade-client.service";
import {
  fetchManagementArchivedGradesClient,
  fetchTeacherArchivedGradesClient,
} from "@features/course-enrollments/services/course-enrollment-grade-history-client.service";
import type { CourseEnrollmentArchivedGrade } from "@features/course-enrollments/types/course-enrollment-archived-grade.types";
import type { CourseEnrollmentGrade } from "@features/course-enrollments/types/course-enrollment-grade.types";

type GradesBodyProps = {
  mode: "institutional" | "teacher";
  enrollmentId: string;
  classId?: string;
  variant: "inline" | "dialog";
  canUpdate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  onEdit: (grade: CourseEnrollmentGrade) => void;
  onDelete: (grade: CourseEnrollmentGrade) => void;
  onHistory: (gradeId: string, label: string) => void;
  onCancelDeletion: (grade: CourseEnrollmentGrade) => void;
  onRetry: () => void;
  onErrorChange?: (hasError: boolean) => void;
  reloadToken: number;
};

export function CourseEnrollmentGradesBody({
  mode,
  enrollmentId,
  classId,
  variant,
  canUpdate,
  canDelete,
  canEdit,
  onEdit,
  onDelete,
  onHistory,
  onCancelDeletion,
  onRetry,
  onErrorChange,
  reloadToken,
}: GradesBodyProps): ReactElement {
  const [grades, setGrades] = useState<CourseEnrollmentGrade[]>([]);

  const [archived, setArchived] = useState<CourseEnrollmentArchivedGrade[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);

  const isTeacher = mode === "teacher" && classId !== undefined;

  useEffect(() => {
    let cancelled = false;

    const gradesRequest = isTeacher && classId ? fetchTeacherGradesClient(classId, enrollmentId) : fetchManagementGradesClient(enrollmentId);

    const archivedRequest =
      isTeacher && classId ? fetchTeacherArchivedGradesClient(classId, enrollmentId) : fetchManagementArchivedGradesClient(enrollmentId);

    Promise.all([gradesRequest, archivedRequest])
      .then(([gradesData, archivedData]) => {
        if (!cancelled) {
          setGrades(gradesData);
          setArchived(archivedData);
          setLoadError(null);
          onErrorChange?.(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED);
          onErrorChange?.(true);
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
  }, [mode, enrollmentId, classId, isTeacher, onErrorChange, reloadToken]);

  if (isLoading) {
    return <GradeListSkeleton />;
  }

  if (loadError) {
    if (variant === "dialog") {
      return (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
        <div className="flex justify-end gap-2">
          <Button type="button" size="lg" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (grades.length === 0 && archived.length === 0) {
    return <GradeListEmpty />;
  }

  return (
    <ul
      className={
        variant === "dialog" ? "max-h-[50dvh] divide-y overflow-y-auto rounded-lg border sm:max-h-96" : "divide-y overflow-hidden rounded-lg border"
      }
    >
      {grades.map((grade) => (
        <CourseEnrollmentGradeListItem
          key={grade.id}
          grade={grade}
          canUpdate={canUpdate}
          canDelete={canDelete}
          canEdit={canEdit}
          onEdit={onEdit}
          onDelete={onDelete}
          onCancelDeletion={onCancelDeletion}
          onViewHistory={(item) => onHistory(item.id, item.evaluation)}
        />
      ))}
      {archived.map((grade) => (
        <CourseEnrollmentDeletedGradeItem key={grade.gradeId} grade={grade} onViewHistory={onHistory} />
      ))}
    </ul>
  );
}
