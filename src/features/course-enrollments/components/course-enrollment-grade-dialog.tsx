"use client";

import { ActionForm } from "@common/components/action-form";
import { safelyRunAction } from "@common/utils/safe-action.util";
import * as React from "react";
import { CircleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import {
  cancelInstitutionalGradeDeletionAction,
  cancelTeacherGradeDeletionAction,
  deleteInstitutionalGradeAction,
  deleteTeacherGradeAction,
} from "@features/course-enrollments/actions/course-enrollment-grade.actions";
import { COURSE_ENROLLMENT_GRADE_MESSAGES } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import { CourseEnrollmentGradeFormDialog } from "@features/course-enrollments/components/course-enrollment-grade-form-dialog";
import { CourseEnrollmentGradeStatusBadge } from "@features/course-enrollments/components/course-enrollment-grade-status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Skeleton } from "@common/components/ui/skeleton";
import { ScrollTextIcon } from "lucide-react";
import { notifyGradesChanged } from "@features/course-enrollments/utils/course-enrollment-grade-events.util";
import {
  fetchManagementGradesClient,
  fetchTeacherGradesClient,
} from "@features/course-enrollments/services/course-enrollment-grade-client.service";
import { formatGradeValue } from "@features/course-enrollments/utils/course-enrollment-grade-format.util";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import type { CourseEnrollmentGrade } from "@features/course-enrollments/types/course-enrollment-grade.types";

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

function formatAudit(prefix: string, person?: { fullName: string } | null, date?: string | null): string | null {
  if (!person || !date) {
    return null;
  }

  const formatted = new Date(date).toLocaleDateString("es-AR");

  return `${prefix} por ${person.fullName} · ${formatted}`;
}

export function CourseEnrollmentGradeDialog({
  enrollment,
  mode,
  canCreate,
  canUpdate,
  canDelete,
  open,
  onOpenChange,
  onChanged,
}: GradeDialogProps): React.ReactElement {
  const [grades, setGrades] = React.useState<CourseEnrollmentGrade[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [formGrade, setFormGrade] = React.useState<CourseEnrollmentGrade | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [deleteGrade, setDeleteGrade] = React.useState<CourseEnrollmentGrade | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const classId = enrollment.courseClassId;

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      if (mode === "teacher") {
        setGrades(await fetchTeacherGradesClient(classId, enrollment.id));
      } else {
        setGrades(await fetchManagementGradesClient(enrollment.id));
      }
    } catch {
      setLoadError(COURSE_ENROLLMENT_GRADE_MESSAGES.LOAD_FAILED);
    } finally {
      setIsLoading(false);
    }
  }, [mode, classId, enrollment.id]);

  React.useEffect(() => {
    if (open) {
      void load();
    }
  }, [open, load]);

  async function handleDelete(): Promise<void> {
    if (!deleteGrade) {
      return;
    }

    setIsDeleting(true);

    const result = await safelyRunAction(
      mode === "teacher"
        ? deleteTeacherGradeAction(classId, enrollment.id, deleteGrade.id, deleteGrade.version)
        : deleteInstitutionalGradeAction(enrollment.id, deleteGrade.id, deleteGrade.version),
      "No se pudo eliminar la nota.",
    );

    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (deleteGrade.publicationStatus === "DRAFT") {
      toast.success("Borrador eliminado.");
    } else {
      toast.success("Nota marcada como pendiente de eliminación.");
    }

    setDeleteGrade(null);
    await load();
    notifyGradesChanged();
    onChanged?.();
  }

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
    await load();
    notifyGradesChanged();
    onChanged?.();
  }

  const canEdit = enrollment.status === "ENROLLED";

  if (!open) {
    return <></>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2.5rem)] max-w-[calc(100%-2.5rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{COURSE_ENROLLMENT_GRADE_MESSAGES.DIALOG_TITLE}</DialogTitle>
          <DialogDescription>
            {enrollment.studentName} · {enrollment.academicSpaceName} · {enrollment.courseClassLabel}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Cargando notas">
            <span className="sr-only" role="status">
              Cargando notas…
            </span>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-48" />
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
                <ScrollTextIcon className="size-5" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-base">Todavía no hay notas cargadas</EmptyTitle>
              <EmptyDescription>{COURSE_ENROLLMENT_GRADE_MESSAGES.NO_GRADES}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="max-h-[50dvh] space-y-3 overflow-y-auto sm:max-h-96">
            {grades.map((grade) => {
              const created = formatAudit("Cargada", grade.createdBy, grade.createdAt);
              const updated = formatAudit("Última modificación", grade.updatedBy, grade.updatedAt);
              const published = formatAudit("Publicada", grade.publishedBy, grade.publishedAt ?? null);

              return (
                <li key={grade.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium wrap-break-word">{grade.evaluation}</p>
                      <p className="text-lg font-semibold tabular-nums">{formatGradeValue(grade.value)}</p>
                      {grade.publishedEvaluation != null &&
                      grade.publicationStatus === "PENDING_CHANGES" &&
                      grade.publishedValue != null ? (
                        <p className="text-muted-foreground text-sm">
                          Publicado actualmente: {formatGradeValue(grade.publishedValue)} → cambio pendiente:{" "}
                          {formatGradeValue(grade.value)}
                        </p>
                      ) : null}
                    </div>
                    <CourseEnrollmentGradeStatusBadge status={grade.publicationStatus} />
                  </div>
                  <div className="text-muted-foreground mt-1 space-y-0.5 text-xs">
                    {created ? <p>{created}</p> : null}
                    {updated ? <p>{updated}</p> : null}
                    {published ? <p>{published}</p> : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {canUpdate && canEdit && grade.publicationStatus !== "PENDING_DELETION" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormGrade(grade);
                          setIsFormOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                    ) : null}
                    {canDelete && canEdit && grade.publicationStatus !== "PENDING_DELETION" ? (
                      <Button variant="outline" size="sm" onClick={() => setDeleteGrade(grade)}>
                        Eliminar
                      </Button>
                    ) : null}
                    {canDelete && canEdit && grade.publicationStatus === "PENDING_DELETION" ? (
                      <Button variant="outline" size="sm" onClick={() => void handleCancelDeletion(grade)}>
                        {COURSE_ENROLLMENT_GRADE_MESSAGES.CANCEL_DELETION}
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {!isLoading && !loadError && canCreate && canEdit ? (
          <div className="sticky bottom-0 flex justify-end bg-popover pt-2">
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
          onSaved={() => {
            void load();
            notifyGradesChanged();
            onChanged?.();
          }}
        />
        <AlertDialog open={deleteGrade !== null} onOpenChange={(next) => !next && !isDeleting && setDeleteGrade(null)}>
          <AlertDialogContent>
            <ActionForm action={async () => handleDelete()} className="space-y-4">
              <AlertDialogHeader>
                <AlertDialogTitle>{COURSE_ENROLLMENT_GRADE_MESSAGES.DELETE_GRADE}</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteGrade?.publicationStatus === "DRAFT"
                    ? COURSE_ENROLLMENT_GRADE_MESSAGES.DELETE_DRAFT_CONFIRM
                    : COURSE_ENROLLMENT_GRADE_MESSAGES.DELETE_PUBLISHED_CONFIRM}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button type="button" variant="outline" disabled={isDeleting} onClick={() => setDeleteGrade(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive" disabled={isDeleting}>
                  {isDeleting ? "Eliminando…" : "Confirmar"}
                </Button>
              </AlertDialogFooter>
            </ActionForm>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
