"use client";

import { useActionState, useMemo, useOptimistic, useState } from "react";
import type { ReactElement } from "react";

import { toast } from "sonner";

import { ActionForm } from "@common/components/action-form";
import { Button } from "@common/components/ui/button";
import { DialogFooter } from "@common/components/ui/dialog";
import { Field, FieldLabel } from "@common/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { safelyRunAction } from "@common/utils/safe-action.util";

import {
  publishBulkInstitutionalGradesAction,
  type BulkPublishClassResult,
  type BulkPublishResult,
} from "@features/course-enrollments/actions/publish-bulk-grades.actions";
import { BulkPublishOutcome } from "@features/course-enrollments/components/bulk-publish-grades-outcome";
import { COURSE_ENROLLMENT_GRADE_BULK_PUBLISH_LIMIT } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import type { PendingClassGrades } from "@features/course-enrollments/types/pending-class-grades.types";
import { notifyGradesChanged } from "@features/course-enrollments/utils/course-enrollment-grade-events.util";

const ALL_COURSES = "all-courses";

const ALL_CLASSES = "all-classes";

const UNCERTAIN_BATCH_MESSAGE = "No se pudo confirmar la publicación. Verificá el estado antes de reintentar.";

type BulkState = BulkPublishResult & {
  classLabels?: Record<string, string>;
  totalClasses?: number;
};

type BulkPublishGradesFormProps = {
  classes: PendingClassGrades[];
  isRefreshing: boolean;
  refreshError: string | null;
  onRefreshPendingClasses: () => void;
  onOpenChange: (open: boolean) => void;
  onPublished: () => void;
  onPendingChange: (pending: boolean) => void;
  onReportAvailable: () => void;
};

function chunkClassIds(classIds: string[], size: number): string[][] {
  const chunks: string[][] = [];

  for (let index = 0; index < classIds.length; index += size) {
    chunks.push(classIds.slice(index, index + size));
  }

  return chunks;
}

export function BulkPublishGradesForm({
  classes,
  isRefreshing,
  refreshError,
  onRefreshPendingClasses,
  onOpenChange,
  onPublished,
  onPendingChange,
  onReportAvailable,
}: BulkPublishGradesFormProps): ReactElement {
  const [courseId, setCourseId] = useState<string>(ALL_COURSES);

  const [classId, setClassId] = useState<string>(ALL_CLASSES);

  const [batchProgress, setBatchProgress] = useOptimistic<{ current: number; total: number } | null>(null);

  const courses = useMemo(() => {
    const byId = new Map<string, string>();

    for (const pending of classes) {
      if (!byId.has(pending.courseId)) {
        byId.set(pending.courseId, pending.courseName);
      }
    }

    return [...byId.entries()].map(([id, name]) => ({ id, name })).sort((left, right) => left.name.localeCompare(right.name, "es"));
  }, [classes]);

  const courseMissing = courseId !== ALL_COURSES && !courses.some((course) => course.id === courseId);

  const effectiveCourseId = courseMissing ? ALL_COURSES : courseId;

  const classOptions = useMemo(() => {
    const filtered = effectiveCourseId === ALL_COURSES ? classes : classes.filter((pending) => pending.courseId === effectiveCourseId);

    return [...filtered].sort((left, right) => left.classLabel.localeCompare(right.classLabel, "es"));
  }, [classes, effectiveCourseId]);

  const classMissing = classId !== ALL_CLASSES && !classOptions.some((option) => option.classId === classId);

  const effectiveClassId = courseMissing || classMissing ? ALL_CLASSES : classId;

  if (courseMissing) {
    setCourseId(ALL_COURSES);
  }

  if (classId !== effectiveClassId) {
    setClassId(effectiveClassId);
  }

  function handleCourseChange(value: string): void {
    setCourseId(value);
    setClassId(ALL_CLASSES);
  }

  const selectedClassIds = effectiveClassId === ALL_CLASSES ? classOptions.map((option) => option.classId) : [effectiveClassId];

  const totalPending = classOptions
    .filter((option) => selectedClassIds.includes(option.classId))
    .reduce((total, option) => total + option.pendingChanges, 0);

  const [state, formAction, isPublishing] = useActionState(async (_previous: BulkState, formData: FormData): Promise<BulkState> => {
    onPendingChange(true);

    try {
      const formIds = formData.getAll("classId").filter((value): value is string => typeof value === "string");

      const requestedIds = [...new Set(formIds.length > 0 ? formIds : selectedClassIds)];

      const classLabels = Object.fromEntries(classes.map((entry) => [entry.classId, `${entry.courseName} · ${entry.classLabel}`]));

      const batches = chunkClassIds(requestedIds, COURSE_ENROLLMENT_GRADE_BULK_PUBLISH_LIMIT);

      const results: BulkPublishClassResult[] = [];

      let error: string | undefined;

      for (let index = 0; index < batches.length; index += 1) {
        setBatchProgress({ current: index + 1, total: batches.length });

        const batchResult = await safelyRunAction(publishBulkInstitutionalGradesAction(batches[index]), "No se pudieron publicar las notas.");

        if (!batchResult.results || batchResult.results.length === 0) {
          error ??= UNCERTAIN_BATCH_MESSAGE;

          for (const pendingClassId of batches[index]) {
            results.push({ classId: pendingClassId, status: "uncertain", error: UNCERTAIN_BATCH_MESSAGE });
          }

          continue;
        }

        error ??= batchResult.error;

        results.push(...batchResult.results);
      }

      const confirmed = results.filter((result) => result.status === "published").length;

      if (confirmed > 0) {
        notifyGradesChanged();
        onPublished();
      }

      if (confirmed === requestedIds.length && error === undefined) {
        toast.success("Notas publicadas correctamente.");
        onOpenChange(false);
      } else {
        onReportAvailable();
        onRefreshPendingClasses();
      }

      return { error, results, classLabels, totalClasses: requestedIds.length };
    } finally {
      onPendingChange(false);
    }
  }, {});

  const batchLabel =
    batchProgress && batchProgress.total > 1 ? `Publicando… (lote ${batchProgress.current} de ${batchProgress.total})` : "Publicando…";

  const publishLabel = isPublishing ? batchLabel : "Publicar notas";

  return (
    <ActionForm action={formAction} className="space-y-4">
      <div className="space-y-4">
        <Field>
          <FieldLabel htmlFor="bulk-course">Curso</FieldLabel>
          <Select value={effectiveCourseId} onValueChange={handleCourseChange} disabled={isPublishing}>
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
          <Select value={effectiveClassId} onValueChange={setClassId} disabled={isPublishing || effectiveCourseId === ALL_COURSES}>
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
        {selectedClassIds.map((id) => (
          <input key={id} type="hidden" name="classId" value={id} />
        ))}
        <p className="text-muted-foreground text-sm">
          {totalPending > 0 ? `${totalPending} cambios pendientes en la selección.` : "Sin cambios en la selección."}
        </p>
        <BulkPublishOutcome
          state={state}
          classLabels={state.classLabels ?? {}}
          totalClasses={state.totalClasses ?? 0}
          isRefreshing={isRefreshing}
          refreshError={refreshError}
          onRefreshPendingClasses={onRefreshPendingClasses}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" size="lg" disabled={isPublishing} onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" disabled={isPublishing || isRefreshing || selectedClassIds.length === 0}>
          {publishLabel}
        </Button>
      </DialogFooter>
    </ActionForm>
  );
}
