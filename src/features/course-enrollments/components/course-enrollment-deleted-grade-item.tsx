"use client";

import type { ReactElement } from "react";

import { EllipsisVerticalIcon, HistoryIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";

import type { CourseEnrollmentArchivedGrade } from "@features/course-enrollments/types/course-enrollment-archived-grade.types";
import { formatGradeValue } from "@features/course-enrollments/utils/course-enrollment-grade-format.util";

type DeletedGradeItemProps = {
  grade: CourseEnrollmentArchivedGrade;
  onViewHistory: (gradeId: string, label: string) => void;
};

export function CourseEnrollmentDeletedGradeItem({ grade, onViewHistory }: DeletedGradeItemProps): ReactElement {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2.5 opacity-70">
      <p className="min-w-0 font-semibold wrap-break-word">{grade.lastEvaluation}</p>
      <div className="flex shrink-0 items-center gap-1.5">
        <Badge variant="destructive">Eliminada</Badge>
        <span className="bg-muted rounded-md px-3 py-1.5 text-lg font-semibold tabular-nums">
          {grade.lastValue != null ? formatGradeValue(grade.lastValue) : "—"}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Acciones de ${grade.lastEvaluation}`}>
              <EllipsisVerticalIcon className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onViewHistory(grade.gradeId, grade.lastEvaluation)}>
              <HistoryIcon aria-hidden="true" />
              Ver historial
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}
