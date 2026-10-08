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
import type { CourseWeekDay } from "@features/academic/types/course-week-day.types";
import { individualFormat, parseInitialClasses, parseNullableInt } from "@features/academic/utils/course-form-draft.util";

export function CourseFields({ institutionField, institutionId, scope, initialValues = {}, fieldErrors }: AcademicFieldsProps): ReactElement {
  const editing = Boolean(initialValues.id);
  const initialClasses = parseInitialClasses(initialValues.classes);
  const initialFormat = toOptionalFormString(initialValues.academicSpaceFormat);

  const [studyPlanId, setStudyPlanId] = useState(toOptionalFormString(initialValues.studyPlanId));
  const [spaceId, setSpaceId] = useState(toOptionalFormString(initialValues.studyPlanSpaceId));
  const [academicSpaceId, setAcademicSpaceId] = useState(toOptionalFormString(initialValues.academicSpaceId));
  const [studyPlanSpaceId, setStudyPlanSpaceId] = useState(toOptionalFormString(initialValues.studyPlanSpaceId));
  const [instrumentId, setInstrumentId] = useState(toOptionalFormString(initialValues.instrumentId));
  const [instrumental, setInstrumental] = useState(Boolean(initialValues.academicSpaceInstrumental));
  const [spaceLabel, setSpaceLabel] = useState<string | undefined>(undefined);
  const [academicYearId, setAcademicYearId] = useState(toOptionalFormString(initialValues.academicYearId));
  const [format, setFormat] = useState<string | undefined>(initialFormat === "INDIVIDUAL" || initialFormat === "GRUPAL" ? initialFormat : undefined);
  const [classes, setClasses] = useState<ClassDraft[]>(() =>
    initialClasses.map((entry) => {
      const courseClass = entry as {
        teachers?: { personId: string; fullName: string }[];
        days?: {
          dayOfWeek: CourseWeekDay;
          capacity: number | null;
          periodDurationMinutes: number | null;
          schedules?: { startTime: string; endTime: string }[];
        }[];
      };

      return {
        teachers: courseClass.teachers ?? [],
        days: (courseClass.days ?? []).map((day) => ({
          dayOfWeek: day.dayOfWeek,
          capacity: day.capacity != null ? String(day.capacity) : "",
          periodDurationMinutes: day.periodDurationMinutes != null ? String(day.periodDurationMinutes) : "",
          schedules: (day.schedules ?? []).map((schedule) => ({
            startTime: schedule.startTime.slice(0, 5),
            endTime: schedule.endTime.slice(0, 5),
          })),
        })),
      };
    }),
  );

  const classesLocked = classes.length > 0;

  function updateClass(index: number, updater: (draft: ClassDraft) => ClassDraft): void {
    setClasses((current) => current.map((draft, classIndex) => (classIndex === index ? updater(draft) : draft)));
  }

  const serializedClasses = JSON.stringify(
    classes.map((courseClass) => ({
      teacherIds: courseClass.teachers.map((teacher) => teacher.personId),
      days: courseClass.days.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        capacity: individualFormat(format) ? null : parseNullableInt(day.capacity),
        periodDurationMinutes: individualFormat(format) ? parseNullableInt(day.periodDurationMinutes) : null,
        schedules: day.schedules,
      })),
    })),
  );

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
            setStudyPlanId={setStudyPlanId}
            setSpaceId={setSpaceId}
            setAcademicSpaceId={setAcademicSpaceId}
            setStudyPlanSpaceId={setStudyPlanSpaceId}
            setInstrumentId={setInstrumentId}
            setInstrumental={setInstrumental}
            setSpaceLabel={setSpaceLabel}
            setFormat={setFormat}
            initialValues={initialValues}
            studyPlanId={studyPlanId}
          />

          <CourseAcademicSpaceField
            fieldErrors={fieldErrors}
            institutionId={institutionId}
            scope={scope}
            studyPlanId={studyPlanId}
            editing={editing}
            classesLocked={classesLocked}
            setSpaceId={setSpaceId}
            setStudyPlanSpaceId={setStudyPlanSpaceId}
            setAcademicSpaceId={setAcademicSpaceId}
            setInstrumentId={setInstrumentId}
            setInstrumental={setInstrumental}
            setSpaceLabel={setSpaceLabel}
            setFormat={setFormat}
            spaceLabel={spaceLabel}
            initialValues={initialValues}
            spaceId={spaceId}
          />

          {instrumental ? (
            <CourseInstrumentField
              fieldErrors={fieldErrors}
              institutionId={institutionId}
              scope={scope}
              editing={editing}
              studyPlanSpaceId={studyPlanSpaceId}
              setInstrumentId={setInstrumentId}
              initialValues={initialValues}
              instrumentId={instrumentId}
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
        spaceId={spaceId}
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
