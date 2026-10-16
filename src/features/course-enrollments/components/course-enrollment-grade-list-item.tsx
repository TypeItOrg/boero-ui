"use client";

import type { ReactElement } from "react";

import { EllipsisVerticalIcon, HistoryIcon, PencilIcon, Trash2Icon, Undo2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";

import { CourseEnrollmentGradeStatusBadge } from "@features/course-enrollments/components/course-enrollment-grade-status-badge";
import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import type { CourseEnrollmentGrade } from "@features/course-enrollments/types/course-enrollment-grade.types";
import { formatGradeValue } from "@features/course-enrollments/utils/course-enrollment-grade-format.util";

type GradeListItemProps = {
  grade: CourseEnrollmentGrade;
  canUpdate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  onEdit: (grade: CourseEnrollmentGrade) => void;
  onDelete: (grade: CourseEnrollmentGrade) => void;
  onCancelDeletion: (grade: CourseEnrollmentGrade) => void;
  onViewHistory: (grade: CourseEnrollmentGrade) => void;
};

export function CourseEnrollmentGradeListItem({
  grade,
  canUpdate,
  canDelete,
  canEdit,
  onEdit,
  onDelete,
  onCancelDeletion,
  onViewHistory,
}: GradeListItemProps): ReactElement {
  const showPill =
    grade.publicationStatus === "DRAFT" || grade.publicationStatus === "PENDING_CHANGES" || grade.publicationStatus === "PENDING_DELETION";

  const showActions = (canUpdate && canEdit) || (canDelete && canEdit);

  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2.5">
      <p className="min-w-0 font-semibold wrap-break-word">{grade.evaluation}</p>
      <div className="flex shrink-0 items-center gap-1.5">
        {showPill ? <CourseEnrollmentGradeStatusBadge status={grade.publicationStatus} /> : null}
        <span className="bg-muted rounded-md px-3 py-1.5 text-lg font-semibold tabular-nums">{formatGradeValue(grade.value)}</span>
        {showActions ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Acciones de ${grade.evaluation}`}>
                <EllipsisVerticalIcon className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdate && canEdit && grade.publicationStatus !== "PENDING_DELETION" ? (
                <DropdownMenuItem onSelect={() => onEdit(grade)}>
                  <PencilIcon aria-hidden="true" />
                  Editar nota
                </DropdownMenuItem>
              ) : null}
              {canDelete && canEdit && grade.publicationStatus !== "PENDING_DELETION" ? (
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(grade)}>
                  <Trash2Icon aria-hidden="true" />
                  Eliminar nota
                </DropdownMenuItem>
              ) : null}
              {canDelete && canEdit && grade.publicationStatus === "PENDING_DELETION" ? (
                <DropdownMenuItem onSelect={() => onCancelDeletion(grade)}>
                  <Undo2Icon aria-hidden="true" />
                  {COURSE_ENROLLMENT_GRADE_MESSAGES.CANCEL_DELETION}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onSelect={() => onViewHistory(grade)}>
                <HistoryIcon aria-hidden="true" />
                Ver historial
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Ver historial de ${grade.evaluation}`}
            title="Ver historial"
            onClick={() => onViewHistory(grade)}
          >
            <HistoryIcon className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </li>
  );
}
