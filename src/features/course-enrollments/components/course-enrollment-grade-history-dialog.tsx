"use client";

import type { ReactElement } from "react";

import { CircleAlertIcon, HistoryIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";

import { CourseEnrollmentGradeHistoryRow, GradeHistorySkeleton } from "@features/course-enrollments/components/course-enrollment-grade-history-row";
import { useCourseEnrollmentGradeHistory } from "@features/course-enrollments/hooks/use-course-enrollment-grade-history";
import { COURSE_ENROLLMENT_PAGE_SIZE_OPTIONS } from "@features/course-enrollments/utils/course-enrollment-pagination.util";

type GradeHistoryDialogProps = {
  mode: "institutional" | "teacher";
  enrollmentId: string;
  classId?: string;
  gradeId: string | null;
  gradeLabel?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type GradeHistoryContentProps = {
  mode: "institutional" | "teacher";
  enrollmentId: string;
  classId?: string;
  gradeId: string;
  gradeLabel?: string;
  onOpenChange: (open: boolean) => void;
};

function GradeHistoryContent({ mode, enrollmentId, classId, gradeId, gradeLabel, onOpenChange }: GradeHistoryContentProps): ReactElement {
  const { page, size, loading, error, history, retry, changePage, changeSize } = useCourseEnrollmentGradeHistory({
    mode,
    enrollmentId,
    classId,
    gradeId,
  });

  const totalItems = history.totalItems;

  const totalPages = history.totalPages;

  const isPristineEmpty = !loading && !error && totalItems === 0;

  const isOutOfRange = !loading && !error && totalItems > 0 && history.items.length === 0;

  const isPaginationDisabled = loading || error !== "";

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2.5rem)] max-w-[calc(100%_-_2.5rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Historial de cambios</DialogTitle>
          <DialogDescription>
            {gradeLabel ? `Historial de “${gradeLabel}”.` : "Historial de la nota."} Registro de operaciones y su estado resultante.
          </DialogDescription>
        </DialogHeader>
        {loading ? <GradeHistorySkeleton /> : null}
        {!loading && error ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {isPristineEmpty ? (
          <Empty className="min-h-48 p-6">
            <EmptyHeader className="max-w-sm">
              <EmptyMedia variant="icon">
                <HistoryIcon className="size-5" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-base">Sin historial</EmptyTitle>
              <EmptyDescription>No hay cambios registrados para esta nota.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
        {isOutOfRange ? (
          <Alert>
            <CircleAlertIcon />
            <AlertDescription>Esta página no contiene eventos. El historial puede haber cambiado.</AlertDescription>
          </Alert>
        ) : null}
        {!loading && !error && !isPristineEmpty && history.items.length > 0 ? (
          <div className="bg-background overflow-x-auto rounded-lg border">
            <Table className="min-w-150 sm:min-w-180">
              <TableHeader className="bg-muted">
                <TableRow className="h-11">
                  <TableHead>Fecha y hora</TableHead>
                  <TableHead>Operación</TableHead>
                  <TableHead>Valores resultantes</TableHead>
                  <TableHead>Autor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.items.map((event) => (
                  <CourseEnrollmentGradeHistoryRow key={event.historyId} event={event} />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
        {!isPristineEmpty ? (
          <DataTablePagination
            isInline
            page={page}
            size={size}
            totalPages={totalPages}
            summaryLabel={`${totalItems} ${totalItems === 1 ? "evento." : "eventos."}`}
            pageSizeOptions={COURSE_ENROLLMENT_PAGE_SIZE_OPTIONS}
            isPending={isPaginationDisabled}
            onPageChange={changePage}
            onPageSizeChange={(nextSize) => changeSize(Number(nextSize))}
          />
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {!loading && error ? (
            <Button type="button" size="lg" onClick={retry}>
              Reintentar
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CourseEnrollmentGradeHistoryDialog({
  mode,
  enrollmentId,
  classId,
  gradeId,
  gradeLabel,
  open,
  onOpenChange,
}: GradeHistoryDialogProps): ReactElement {
  if (!open || !gradeId) {
    return <></>;
  }

  return (
    <GradeHistoryContent
      key={`${mode}-${enrollmentId}-${classId ?? ""}-${gradeId}`}
      mode={mode}
      enrollmentId={enrollmentId}
      classId={classId}
      gradeId={gradeId}
      gradeLabel={gradeLabel}
      onOpenChange={onOpenChange}
    />
  );
}
