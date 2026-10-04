"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Field, FieldLabel } from "@common/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { Skeleton } from "@common/components/ui/skeleton";
import { ScrollTextIcon } from "lucide-react";
import { safelyRunAction } from "@common/utils/safe-action.util";
import { publishBulkInstitutionalGradesAction } from "@features/course-enrollments/actions/publish-bulk-grades.actions";
import { fetchPendingClassesClient } from "@features/course-enrollments/services/pending-class-grades-client.service";
import { notifyGradesChanged } from "@features/course-enrollments/utils/course-enrollment-grade-events.util";
import type { PendingClassGrades } from "@features/course-enrollments/types/pending-class-grades.types";

const ALL_COURSES = "all-courses";
const ALL_CLASSES = "all-classes";

type BulkPublishGradesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublished: () => void;
};

export function BulkPublishGradesDialog({ open, onOpenChange, onPublished }: BulkPublishGradesDialogProps): React.ReactElement {
  const [classes, setClasses] = React.useState<PendingClassGrades[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [courseId, setCourseId] = React.useState<string>(ALL_COURSES);
  const [classId, setClassId] = React.useState<string>(ALL_CLASSES);
  const [isPublishing, setIsPublishing] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setIsLoading(true);
    setCourseId(ALL_COURSES);
    setClassId(ALL_CLASSES);

    fetchPendingClassesClient()
      .then((data) => setClasses(data))
      .catch(() => setClasses([]))
      .finally(() => setIsLoading(false));
  }, [open ]);

  const courses = React.useMemo(() => {
    const byId = new Map<string, string>();

    for (const pending of classes) {
      if (!byId.has(pending.courseId)) {
        byId.set(pending.courseId, pending.courseName);
      }
    }

    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name, "es"));
  }, [classes]);

  const classOptions = React.useMemo(() => {
    const filtered = courseId === ALL_COURSES ? classes : classes.filter((pending) => pending.courseId === courseId);

    return [...filtered].sort((left, right) => left.classLabel.localeCompare(right.classLabel, "es"));
  }, [classes, courseId]);

  function handleCourseChange(value: string): void {
    setCourseId(value);
    setClassId(ALL_CLASSES);
  }

  const selectedClassIds =
    classId === ALL_CLASSES ? classOptions.map((option) => option.classId) : [classId];
  const totalPending = classOptions
    .filter((option) => selectedClassIds.includes(option.classId))
    .reduce((total, option) => total + option.pendingChanges, 0);

  async function handlePublish(): Promise<void> {
    if (selectedClassIds.length === 0) {
      return;
    }

    setIsPublishing(true);

    const result = await safelyRunAction(publishBulkInstitutionalGradesAction(selectedClassIds), "No se pudieron publicar las notas.");

    setIsPublishing(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if ((result.failedClasses ?? 0) > 0) {
      toast.success(`Se publicaron ${result.publishedClasses} clases. ${result.failedClasses} fallaron.`);
    } else {
      toast.success("Notas publicadas correctamente.");
    }

    onOpenChange(false);
    notifyGradesChanged();
    onPublished();
  }

  if (!open) {
    return <></>;
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPublishing && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publicar notas</DialogTitle>
          <DialogDescription>Seleccioná el curso y la clase con cambios pendientes.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Cargando clases con cambios">
            <span className="sr-only" role="status">
              Cargando clases con cambios…
            </span>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : classes.length === 0 ? (
          <Empty className="min-h-56 p-6">
            <EmptyHeader className="max-w-sm">
              <EmptyMedia variant="icon">
                <ScrollTextIcon className="size-5" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-base">Sin cambios pendientes</EmptyTitle>
              <EmptyDescription>No hay clases con cambios pendientes de notas para publicar.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="bulk-course">Curso</FieldLabel>
              <Select value={courseId} onValueChange={handleCourseChange} disabled={isPublishing}>
                <SelectTrigger id="bulk-course" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={ALL_COURSES} className="px-2.5 py-1.5">
                      Todos los cursos
                    </SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id} className="px-2.5 py-1.5">
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="bulk-class">Clase</FieldLabel>
              <Select value={classId} onValueChange={setClassId} disabled={isPublishing || courseId === ALL_COURSES}>
                <SelectTrigger id="bulk-class" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={ALL_CLASSES} className="px-2.5 py-1.5">
                      Todas las clases
                    </SelectItem>
                    {classOptions.map((option) => (
                      <SelectItem key={option.classId} value={option.classId} className="px-2.5 py-1.5">
                        {option.classLabel} · {option.pendingChanges} pendientes
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <p className="text-muted-foreground text-sm">
              {totalPending > 0 ? `${totalPending} cambios pendientes en la selección.` : "Sin cambios en la selección."}
            </p>
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" size="lg" disabled={isPublishing} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" size="lg" disabled={isPublishing || isLoading || selectedClassIds.length === 0} onClick={() => void handlePublish()}>
            {isPublishing ? "Publicando…" : "Publicar notas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
