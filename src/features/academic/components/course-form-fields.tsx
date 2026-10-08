"use client";

import { useState, type ReactElement } from "react";

import { GraduationCapIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { toOptionalFormString } from "@common/utils/form-value.util";

import { CourseAcademicSpaceField } from "@features/academic/components/course-academic-space-field";
import { CourseAcademicYearField } from "@features/academic/components/course-academic-year-field";
import { CourseClassesSection } from "@features/academic/components/course-classes-section";
import { CourseInstrumentField } from "@features/academic/components/course-instrument-field";
import { CourseStudyPlanField } from "@features/academic/components/course-study-plan-field";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";
import { type ClassDraft } from "@features/academic/types/course-class-draft.types";
import { createCourseClassDrafts, serializeCourseClasses } from "@features/academic/utils/course-form-draft.util";
import { changeCourseAcademicSpace, changeCourseStudyPlan, createCourseFormSelection } from "@features/academic/utils/course-form-selection.util";

export function CourseFields(props: AcademicFieldsProps): ReactElement {
  return <CourseFormFields key={`${props.scope}:${props.institutionId}:${props.initialValues?.id ?? "new"}`} {...props} />;
}

function CourseFormFields({ institutionField, institutionId, scope, initialValues = {}, fieldErrors }: AcademicFieldsProps): ReactElement {
  const editing = Boolean(initialValues.id);
  const [selection, setSelection] = useState(() => createCourseFormSelection(initialValues));
  const { studyPlanId, studyPlanSpaceId, academicSpaceId, instrumentId, instrumental, spaceLabel, format } = selection;
  const [academicYearId, setAcademicYearId] = useState(toOptionalFormString(initialValues.academicYearId));
  const [classes, setClasses] = useState<ClassDraft[]>(() => createCourseClassDrafts(initialValues.classes));

  const classesLocked = classes.length > 0;

  function updateClass(index: number, updater: (draft: ClassDraft) => ClassDraft): void {
    setClasses((current) => current.map((draft, classIndex) => (classIndex === index ? updater(draft) : draft)));
  }

  const serializedClasses = serializeCourseClasses(classes, format);

  return (
    <>
      <input type="hidden" name="studyPlanId" value={studyPlanId ?? ""} />
      <input type="hidden" name="studyPlanSpaceId" value={studyPlanSpaceId ?? ""} />
      <input type="hidden" name="academicSpaceId" value={academicSpaceId ?? ""} />
      <input type="hidden" name="instrumentId" value={instrumentId ?? ""} />
      <input type="hidden" name="academicYearId" value={academicYearId ?? ""} />
      <input type="hidden" name="format" value={format ?? ""} />
      <input type="hidden" name="classes" value={serializedClasses} />

      <section aria-labelledby="course-form-details-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <SectionHeader
            icon={GraduationCapIcon}
            title="Datos del curso"
            description="Instanciá un espacio académico de un plan activo, elegí el ciclo lectivo y armá sus clases."
            titleId="course-form-details-title"
          />
        </header>
        <div className="mt-5 flex flex-wrap gap-4">
          {institutionField}
          <CourseStudyPlanField
            fieldErrors={fieldErrors}
            institutionId={institutionId}
            scope={scope}
            editing={editing}
            classesLocked={classesLocked}
            initialValues={initialValues}
            studyPlanId={studyPlanId}
            onValueChange={(value) => setSelection((current) => changeCourseStudyPlan(current, value))}
          />

          <CourseAcademicSpaceField
            fieldErrors={fieldErrors}
            institutionId={institutionId}
            scope={scope}
            studyPlanId={studyPlanId}
            editing={editing}
            classesLocked={classesLocked}
            spaceLabel={spaceLabel}
            initialValues={initialValues}
            spaceId={studyPlanSpaceId}
            onValueChange={(value, item) => setSelection((current) => changeCourseAcademicSpace(current, value, item))}
          />

          {instrumental ? (
            <CourseInstrumentField
              fieldErrors={fieldErrors}
              institutionId={institutionId}
              scope={scope}
              editing={editing}
              studyPlanSpaceId={studyPlanSpaceId}
              initialValues={initialValues}
              instrumentId={instrumentId}
              onValueChange={(value) => setSelection((current) => ({ ...current, instrumentId: value }))}
            />
          ) : null}

          <CourseAcademicYearField
            fieldErrors={fieldErrors}
            institutionId={institutionId}
            scope={scope}
            editing={editing}
            setAcademicYearId={setAcademicYearId}
            initialValues={initialValues}
            academicYearId={academicYearId}
          />
        </div>
      </section>

      <CourseClassesSection
        classes={classes}
        spaceId={studyPlanSpaceId}
        setClasses={setClasses}
        fieldErrors={fieldErrors}
        format={format}
        institutionId={institutionId}
        updateClass={updateClass}
        scope={scope}
      />
    </>
  );
}
