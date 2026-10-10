"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { CalendarDaysIcon, GraduationCapIcon, PlusIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Button } from "@common/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { FieldError } from "@common/components/ui/field";

import { ClassCard } from "@features/academic/components/course-class-card";
import { type ClassDraft } from "@features/academic/types/course-class-draft.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export function CourseClassesSection({
  classes,
  spaceId,
  setClasses,
  fieldErrors,
  format,
  institutionId,
  updateClass,
  scope,
}: {
  classes: ClassDraft[];
  spaceId: string | undefined;
  setClasses: Dispatch<SetStateAction<ClassDraft[]>>;
  fieldErrors: Record<string, string> | undefined;
  format: string | undefined;
  institutionId: string | undefined;
  updateClass: (index: number, updater: (draft: ClassDraft) => ClassDraft) => void;
  scope: AcademicScope | undefined;
}): ReactElement {
  return (
    <section aria-labelledby="course-form-classes-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={CalendarDaysIcon}
          title="Clases del curso"
          description="Organizá docentes, días y franjas horarias para cada grupo."
          titleId="course-form-classes-title"
          action={
            classes.length > 0 ? (
              <Button
                disabled={!spaceId}
                onClick={() => setClasses((current) => [...current, { teachers: [], days: [] }])}
                size="lg"
                type="button"
                variant="outline"
              >
                <PlusIcon data-icon="inline-start" /> Agregar clase
              </Button>
            ) : null
          }
        />
      </header>

      {fieldErrors?.classes ? <FieldError className="mt-4" errors={[{ message: fieldErrors.classes }]} /> : null}

      {classes.length === 0 ? (
        <Empty className="mt-5 min-h-56 border-0 bg-transparent">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GraduationCapIcon className="size-5" />
            </EmptyMedia>
            <EmptyTitle className="mt-2 text-base">Creá la primera clase del curso</EmptyTitle>
            <EmptyDescription>
              {spaceId
                ? "Definí quiénes enseñan, qué días se cursa y cómo se distribuyen sus horarios."
                : "Seleccioná un plan y un espacio académico para habilitar la organización de clases."}
            </EmptyDescription>
          </EmptyHeader>
          {spaceId ? (
            <EmptyContent>
              <Button onClick={() => setClasses((current) => [...current, { teachers: [], days: [] }])} size="lg" type="button">
                <PlusIcon data-icon="inline-start" /> Agregar primera clase
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {classes.map((courseClass, classIndex) => (
            <ClassCard
              fieldErrors={fieldErrors}
              format={format}
              institutionId={institutionId}
              key={classIndex}
              onRemove={() => setClasses((current) => current.filter((_, index) => index !== classIndex))}
              onUpdate={(updater) => updateClass(classIndex, updater)}
              scope={scope}
              title={`Clase ${classIndex + 1}`}
              courseClass={courseClass}
            />
          ))}
        </div>
      )}
    </section>
  );
}
