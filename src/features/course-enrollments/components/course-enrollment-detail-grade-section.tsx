"use client";

import { useCallback, useState } from "react";
import type { ReactElement } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@common/components/ui/card";
import { safelyRunAction } from "@common/utils/safe-action.util";

import {
  cancelInstitutionalGradeDeletionAction,
  deleteInstitutionalGradeAction,
} from "@features/course-enrollments/actions/course-enrollment-grade.actions";
import { CourseEnrollmentGradeDeleteDialog } from "@features/course-enrollments/components/course-enrollment-grade-delete-dialog";
import { CourseEnrollmentGradeFormDialog } from "@features/course-enrollments/components/course-enrollment-grade-form-dialog";
import { CourseEnrollmentGradeHistoryDialog } from "@features/course-enrollments/components/course-enrollment-grade-history-dialog";
import { CourseEnrollmentGradesBody } from "@features/course-enrollments/components/course-enrollment-grades-body";
import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import type { CourseEnrollmentGrade } from "@features/course-enrollments/types/course-enrollment-grade.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import { notifyGradesChanged, useGradesChangedListener } from "@features/course-enrollments/utils/course-enrollment-grade-events.util";

type DetailGradeSectionProps = {
  enrollment: CourseEnrollment;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

export function CourseEnrollmentDetailGradeSection({ enrollment, canRead, canCreate, canUpdate, canDelete }: DetailGradeSectionProps): ReactElement {
  const router = useRouter();

  const [formGrade, setFormGrade] = useState<CourseEnrollmentGrade | undefined>(undefined);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [deleteGrade, setDeleteGrade] = useState<CourseEnrollmentGrade | null>(null);

  const [historyGrade, setHistoryGrade] = useState<{ id: string; label: string } | null>(null);

  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useGradesChangedListener(reload);

  async function handleCancelDeletion(grade: CourseEnrollmentGrade): Promise<void> {
    const result = await safelyRunAction(cancelInstitutionalGradeDeletionAction(enrollment.id, grade.id), "No se pudo deshacer la eliminación.");

    if (result.error) {
      toast.error(result.error);

      return;
    }

    toast.success("Eliminación deshecha.");
    reload();
    notifyGradesChanged();
    router.refresh();
  }

  function handleSaved(): void {
    reload();
    notifyGradesChanged();
    router.refresh();
  }

  if (!canRead) {
    return <></>;
  }

  const canEdit = enrollment.status === "ENROLLED";

  const showAddButton = canCreate && canEdit;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Notas</CardTitle>
        {showAddButton ? (
          <Button
            size="lg"
            onClick={() => {
              setFormGrade(undefined);
              setIsFormOpen(true);
            }}
          >
            {COURSE_ENROLLMENT_GRADE_MESSAGES.ADD_GRADE}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <CourseEnrollmentGradesBody
          key={enrollment.id}
          mode="institutional"
          enrollmentId={enrollment.id}
          variant="inline"
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
          reloadToken={reloadToken}
        />
      </CardContent>
      <CourseEnrollmentGradeFormDialog
        mode="institutional"
        enrollmentId={enrollment.id}
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
        onConfirm={(grade) => deleteInstitutionalGradeAction(enrollment.id, grade.id, grade.version)}
        onDeleted={() => {
          setDeleteGrade(null);
          handleSaved();
        }}
      />
      <CourseEnrollmentGradeHistoryDialog
        key={historyGrade ? `history-${historyGrade.id}` : "history-closed"}
        mode="institutional"
        enrollmentId={enrollment.id}
        gradeId={historyGrade?.id ?? null}
        gradeLabel={historyGrade?.label}
        open={historyGrade !== null}
        onOpenChange={(next) => {
          if (!next) {
            setHistoryGrade(null);
          }
        }}
      />
    </Card>
  );
}
