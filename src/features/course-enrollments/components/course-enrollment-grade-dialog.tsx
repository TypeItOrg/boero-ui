"use client";

import { useCallback, useState } from "react";
import type { ReactElement } from "react";

import { toast } from "sonner";

import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { safelyRunAction } from "@common/utils/safe-action.util";

import {
  cancelInstitutionalGradeDeletionAction,
  cancelTeacherGradeDeletionAction,
  deleteInstitutionalGradeAction,
  deleteTeacherGradeAction,
} from "@features/course-enrollments/actions/course-enrollment-grade.actions";
import { CourseEnrollmentGradeDeleteDialog } from "@features/course-enrollments/components/course-enrollment-grade-delete-dialog";
import { CourseEnrollmentGradeFormDialog } from "@features/course-enrollments/components/course-enrollment-grade-form-dialog";
import { CourseEnrollmentGradeHistoryDialog } from "@features/course-enrollments/components/course-enrollment-grade-history-dialog";
import { CourseEnrollmentGradesBody } from "@features/course-enrollments/components/course-enrollment-grades-body";
import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import type { CourseEnrollmentGrade } from "@features/course-enrollments/types/course-enrollment-grade.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import { notifyGradesChanged } from "@features/course-enrollments/utils/course-enrollment-grade-events.util";

type GradeDialogProps = {
  enrollment: CourseEnrollment;
  mode: "institutional" | "teacher";
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
};

export function CourseEnrollmentGradeDialog({
  enrollment,
  mode,
  canCreate,
  canUpdate,
  canDelete,
  open,
  onOpenChange,
  onChanged,
}: GradeDialogProps): ReactElement {
  const [formGrade, setFormGrade] = useState<CourseEnrollmentGrade | undefined>(undefined);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [deleteGrade, setDeleteGrade] = useState<CourseEnrollmentGrade | null>(null);

  const [historyGrade, setHistoryGrade] = useState<{ id: string; label: string } | null>(null);

  const [reloadToken, setReloadToken] = useState(0);

  const [listError, setListError] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    setListError(false);
  }

  const classId = enrollment.courseClassId;

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  async function handleCancelDeletion(grade: CourseEnrollmentGrade): Promise<void> {
    const result = await safelyRunAction(
      mode === "teacher"
        ? cancelTeacherGradeDeletionAction(classId, enrollment.id, grade.id)
        : cancelInstitutionalGradeDeletionAction(enrollment.id, grade.id),
      "No se pudo deshacer la eliminación.",
    );

    if (result.error) {
      toast.error(result.error);

      return;
    }

    toast.success("Eliminación deshecha.");
    reload();
    notifyGradesChanged();
    onChanged?.();
  }

  function handleSaved(): void {
    reload();
    notifyGradesChanged();
    onChanged?.();
  }

  function handleDeleteConfirm(grade: CourseEnrollmentGrade): Promise<{ error?: string }> {
    if (mode === "teacher") {
      return deleteTeacherGradeAction(classId, enrollment.id, grade.id, grade.version);
    }

    return deleteInstitutionalGradeAction(enrollment.id, grade.id, grade.version);
  }

  if (!open) {
    return <></>;
  }

  const canEdit = enrollment.status === "ENROLLED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2.5rem)] max-w-[calc(100%_-_2.5rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{COURSE_ENROLLMENT_GRADE_MESSAGES.DIALOG_TITLE}</DialogTitle>
          <DialogDescription>
            {enrollment.studentName} · {enrollment.academicSpaceName} · {enrollment.courseClassLabel}
          </DialogDescription>
        </DialogHeader>
        <CourseEnrollmentGradesBody
          key={`${enrollment.id}-${mode}`}
          mode={mode}
          enrollmentId={enrollment.id}
          classId={classId}
          variant="dialog"
          canUpdate={canUpdate}
          canDelete={canDelete}
          canEdit={canEdit}
          onEdit={(grade) => {
            setFormGrade(grade);
            setIsFormOpen(true);
          }}
          onDelete={setDeleteGrade}
          onHistory={(gradeId, label) => setHistoryGrade({ id: gradeId, label })}
          onCancelDeletion={(grade) => void handleCancelDeletion(grade)}
          onRetry={reload}
          onErrorChange={setListError}
          reloadToken={reloadToken}
        />
        {listError ? (
          <div className="bg-popover sticky bottom-0 flex justify-end gap-2 pt-2">
            <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button size="lg" onClick={reload}>
              Reintentar
            </Button>
          </div>
        ) : null}
        {!listError && canCreate && canEdit ? (
          <div className="bg-popover sticky bottom-0 flex justify-end pt-2">
            <Button
              size="lg"
              onClick={() => {
                setFormGrade(undefined);
                setIsFormOpen(true);
              }}
            >
              {COURSE_ENROLLMENT_GRADE_MESSAGES.ADD_GRADE}
            </Button>
          </div>
        ) : null}
        <CourseEnrollmentGradeFormDialog
          mode={mode}
          enrollmentId={enrollment.id}
          classId={classId}
          grade={formGrade}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSaved={handleSaved}
        />
        <CourseEnrollmentGradeDeleteDialog
          grade={deleteGrade}
          onOpenChange={(next) => {
            if (!next) {
              setDeleteGrade(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
          onDeleted={() => {
            setDeleteGrade(null);
            handleSaved();
          }}
        />
        <CourseEnrollmentGradeHistoryDialog
          key={historyGrade ? `history-${historyGrade.id}` : "history-closed"}
          mode={mode}
          enrollmentId={enrollment.id}
          classId={mode === "teacher" ? classId : undefined}
          gradeId={historyGrade?.id ?? null}
          gradeLabel={historyGrade?.label}
          open={historyGrade !== null}
          onOpenChange={(next) => {
            if (!next) {
              setHistoryGrade(null);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
