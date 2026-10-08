"use client";

import type { ReactElement } from "react";

import { XIcon } from "lucide-react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";

import { FormField } from "@features/academic/components/academic-form-controls";
import { fetchCourseTeacherOptions, type CourseTeacherOption } from "@features/academic/services/course-options.service";
import { type ClassDraft } from "@features/academic/types/course-class-draft.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

export function CourseClassTeacherField({
  teachersFieldId,
  teacherError,
  courseClass,
  onUpdate,
  institutionId,
  scope,
}: {
  teachersFieldId: string;
  teacherError: "Seleccioná al menos un docente." | undefined;
  courseClass: ClassDraft;
  onUpdate: (updater: (draft: ClassDraft) => ClassDraft) => void;
  institutionId: string | undefined;
  scope: AcademicScope | undefined;
}): ReactElement {
  return (
    <FormField label="Docentes" name={teachersFieldId} error={teacherError} required>
      <div className="mt-1 flex flex-col gap-3">
        <div className="bg-muted/20 flex min-h-12 flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5">
          {courseClass.teachers.length === 0 ? <p className="text-muted-foreground text-sm">Los docentes seleccionados se mostrarán aquí.</p> : null}
          {courseClass.teachers.map((teacher) => (
            <Badge className="h-7 gap-2 px-3" key={teacher.personId} size="lg" variant="secondary">
              <span className="max-w-full truncate">{teacher.fullName}</span>
              <Button
                aria-label={`Quitar a ${teacher.fullName}`}
                className="text-muted-foreground hover:text-foreground -mr-1"
                onClick={() =>
                  onUpdate((draft) => ({
                    ...draft,
                    teachers: draft.teachers.filter((candidate) => candidate.personId !== teacher.personId),
                  }))
                }
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <XIcon />
              </Button>
            </Badge>
          ))}
        </div>
        {institutionId && scope ? (
          <AsyncDropdown<CourseTeacherOption>
            ariaInvalid={Boolean(teacherError)}
            closeOnSelect={false}
            emptyMessage="No se encontraron docentes."
            errorMessage="No se pudieron cargar los docentes."
            fetchPage={(input) => fetchCourseTeacherOptions(scope, institutionId, input)}
            getItemLabel={(item) => item.fullName}
            getItemValue={(item) => item.id}
            id={teachersFieldId}
            onValueChange={(value, item) => {
              if (!value || !item) {
                return;
              }

              onUpdate((draft) => {
                const isSelected = draft.teachers.some((teacher) => teacher.personId === value);

                return {
                  ...draft,
                  teachers: isSelected
                    ? draft.teachers.filter((teacher) => teacher.personId !== value)
                    : [...draft.teachers, { personId: item.id, fullName: item.fullName }],
                };
              });
            }}
            placeholder="Agregar docente…"
            queryKey={["courses", "teachers", scope, institutionId]}
            searchPlaceholder="Buscar docente…"
            selectedValues={courseClass.teachers.map((teacher) => teacher.personId)}
          />
        ) : null}
      </div>
    </FormField>
  );
}
