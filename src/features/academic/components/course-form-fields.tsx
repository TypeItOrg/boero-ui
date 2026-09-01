"use client";

import * as React from "react";
import { ArrowRightIcon, CalendarDaysIcon, GraduationCapIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Badge } from "@common/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Input } from "@common/components/ui/input";
import { NumericInput, TimeInput } from "@common/components/ui/restricted-input";
import { ToggleGroup, ToggleGroupItem } from "@common/components/ui/toggle-group";
import { cn } from "@common/utils/cn.util";
import { toOptionalFormString } from "@common/utils/form-value.util";
import { FormField } from "@features/academic/components/academic-form-controls";
import { fetchCourseSpaceOptions, fetchCourseTeacherOptions, type CourseTeacherOption } from "@features/academic/services/course-options.service";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";
import type { CourseWeekDay } from "@features/academic/types/course-week-day.types";
import { COURSE_WEEK_DAY } from "@features/academic/types/course-week-day.types";
import { academicSpaceFormatLabels, academicSpaceTypeLabels } from "@features/academic/utils/academic-labels.util";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

const WEEK_DAY_LABELS: Record<CourseWeekDay, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
};

type ScheduleDraft = { startTime: string; endTime: string };

type DayDraft = {
  dayOfWeek: CourseWeekDay;
  capacity: string;
  periodDurationMinutes: string;
  schedules: ScheduleDraft[];
};

type ClassDraft = {
  teachers: { personId: string; fullName: string }[];
  days: DayDraft[];
};

function emptySchedule(): ScheduleDraft {
  return { startTime: "", endTime: "" };
}

function emptyDay(dayOfWeek: CourseWeekDay): DayDraft {
  return { dayOfWeek, capacity: "", periodDurationMinutes: "", schedules: [emptySchedule()] };
}

function toMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return -1;
  return Number(match[1]) * 60 + Number(match[2]);
}

function parseInitialClasses(value: unknown): unknown[] {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
}

export function CourseFields({ institutionField, institutionId, scope, initialValues = {}, fieldErrors }: AcademicFieldsProps): React.ReactElement {
  const editing = Boolean(initialValues.id);
  const initialClasses = parseInitialClasses(initialValues.classes);
  const initialFormat = toOptionalFormString(initialValues.academicSpaceFormat);

  const [studyPlanId, setStudyPlanId] = React.useState(toOptionalFormString(initialValues.studyPlanId));
  const [spaceId, setSpaceId] = React.useState(toOptionalFormString(initialValues.academicSpaceId));
  const [spaceLabel, setSpaceLabel] = React.useState<string | undefined>(undefined);
  const [academicYearId, setAcademicYearId] = React.useState(toOptionalFormString(initialValues.academicYearId));
  const [format, setFormat] = React.useState<string | undefined>(
    initialFormat === "INDIVIDUAL" || initialFormat === "GRUPAL" ? initialFormat : undefined,
  );
  const [classes, setClasses] = React.useState<ClassDraft[]>(() =>
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
      <input type="hidden" name="academicSpaceId" value={spaceId ?? ""} />
      <input type="hidden" name="academicYearId" value={academicYearId ?? ""} />
      <input type="hidden" name="format" value={format ?? ""} />
      <input type="hidden" name="classes" value={serializedClasses} />

      <section aria-labelledby="course-form-details-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <GraduationCapIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="course-form-details-title" className="text-base font-semibold">
                Datos del curso
              </h2>
              <p className="text-muted-foreground text-sm">
                Instanciá un espacio académico de un plan activo, elegí el ciclo lectivo y armá sus clases.
              </p>
            </div>
          </div>
        </header>
        <div className="mt-5 flex flex-wrap gap-4">
          {institutionField}
          <FormField label="Plan de estudio" name="studyPlanId" error={fieldErrors?.studyPlanId} className="flex-[1_0_min(300px,100%)]" required>
            {institutionId && scope ? (
              <AsyncDropdown<{ id: string; name: string }>
                ariaInvalid={Boolean(fieldErrors?.studyPlanId)}
                disabled={editing || classesLocked}
                emptyMessage="No se encontraron planes activos."
                errorMessage="No se pudieron cargar los planes de estudio."
                fetchPage={(input) =>
                  fetchAcademicOptionPage<{ id: string; name: string }>("study-plans", scope, institutionId, input, {
                    active: "all",
                    status: "ACTIVE",
                  })
                }
                getItemLabel={(item) => item.name}
                getItemValue={(item) => item.id}
                id="studyPlanId"
                key={`plan-${institutionId}`}
                name="studyPlanDisplay"
                onValueChange={(value) => {
                  setStudyPlanId(value);
                  setSpaceId(undefined);
                  setSpaceLabel(undefined);
                  setFormat(undefined);
                }}
                placeholder={classesLocked ? "Definido por el curso" : "Seleccionar plan"}
                queryKey={["courses", "study-plans", scope, institutionId]}
                searchPlaceholder="Buscar plan…"
                selectedLabel={toOptionalFormString(initialValues.studyPlanName)}
                value={studyPlanId}
              />
            ) : (
              <Input disabled placeholder="Seleccioná una institución primero" type="text" />
            )}
          </FormField>

          <FormField
            label="Espacio académico"
            name="academicSpaceId"
            error={fieldErrors?.academicSpaceId}
            className="flex-[1_0_min(300px,100%)]"
            required
          >
            {institutionId && scope ? (
              studyPlanId ? (
                <AsyncDropdown
                  ariaInvalid={Boolean(fieldErrors?.academicSpaceId)}
                  disabled={editing || classesLocked}
                  emptyDescription="Incorporá espacios al plan para poder instanciarlos."
                  emptyIcon={GraduationCapIcon}
                  emptyMessage="No se encontraron espacios en este plan."
                  emptyTitle="No hay espacios"
                  errorMessage="No se pudieron cargar los espacios del plan."
                  fetchPage={(input) => fetchCourseSpaceOptions(scope, institutionId, studyPlanId, input)}
                  getItemLabel={(item) =>
                    `${item.name} · ${academicSpaceTypeLabels[item.type as keyof typeof academicSpaceTypeLabels]} · ${academicSpaceFormatLabels[item.format as keyof typeof academicSpaceFormatLabels]}`
                  }
                  getItemValue={(item) => item.id}
                  id="academicSpaceId"
                  key={`space-${institutionId}-${studyPlanId}`}
                  name="academicSpaceDisplay"
                  onValueChange={(value, item) => {
                    setSpaceId(value);
                    if (item) {
                      setSpaceLabel(
                        `${item.name} · ${academicSpaceTypeLabels[item.type as keyof typeof academicSpaceTypeLabels]} · ${academicSpaceFormatLabels[item.format as keyof typeof academicSpaceFormatLabels]}`,
                      );
                      setFormat(item.format);
                    }
                  }}
                  placeholder={classesLocked ? "Definido por el curso" : "Seleccionar espacio"}
                  queryKey={["courses", "spaces", scope, institutionId, studyPlanId]}
                  searchPlaceholder="Buscar espacio…"
                  selectedLabel={spaceLabel ?? composeInitialSpaceLabel(initialValues)}
                  value={spaceId}
                />
              ) : (
                <Input disabled placeholder="Primero seleccioná un plan de estudio" type="text" />
              )
            ) : (
              <Input disabled placeholder="Seleccioná una institución primero" type="text" />
            )}
          </FormField>

          <FormField label="Ciclo lectivo" name="academicYearId" error={fieldErrors?.academicYearId} className="w-full flex-[1_0_100%]" required>
            {institutionId && scope ? (
              <AsyncDropdown<{ id: string; year: number }>
                ariaInvalid={Boolean(fieldErrors?.academicYearId)}
                disabled={editing}
                emptyMessage="No se encontraron ciclos lectivos."
                errorMessage="No se pudieron cargar los ciclos lectivos."
                fetchPage={(input) =>
                  fetchAcademicOptionPage<{ id: string; year: number }>("academic-years", scope, institutionId, input, {
                    active: "all",
                    status: "ACTIVE",
                  })
                }
                getItemLabel={(item) => String(item.year)}
                getItemValue={(item) => item.id}
                id="academicYearId"
                key={`year-${institutionId}`}
                name="academicYearDisplay"
                onValueChange={(value) => setAcademicYearId(value)}
                placeholder={editing ? "Definido por el curso" : "Seleccionar ciclo lectivo"}
                queryKey={["courses", "academic-years", scope, institutionId]}
                searchPlaceholder="Buscar año…"
                selectedLabel={initialValues.year !== undefined ? String(initialValues.year) : undefined}
                value={academicYearId}
              />
            ) : (
              <Input disabled placeholder="Seleccioná una institución primero" type="text" />
            )}
          </FormField>
        </div>
      </section>

      <section aria-labelledby="course-form-classes-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="-mx-5 flex flex-col gap-3 border-b px-5 pb-5 sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:px-6">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <CalendarDaysIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="course-form-classes-title" className="text-base font-semibold">
                Clases del curso
              </h2>
              <p className="text-muted-foreground text-sm">Organizá docentes, días y franjas horarias para cada grupo.</p>
            </div>
          </div>
          {classes.length > 0 ? (
            <Button
              disabled={!spaceId}
              onClick={() => setClasses((current) => [...current, { teachers: [], days: [] }])}
              size="lg"
              type="button"
              variant="outline"
            >
              <PlusIcon data-icon="inline-start" /> Agregar clase
            </Button>
          ) : null}
        </header>

        {classes.length === 0 ? (
          <Empty className="mt-5 min-h-56 border-0 bg-transparent">
            <EmptyHeader>
              <EmptyMedia className="bg-primary/10 text-primary size-12 rounded-xl" variant="icon">
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
    </>
  );
}

function individualFormat(format: string | undefined): boolean {
  return format === "INDIVIDUAL";
}

function parseNullableInt(value: string): number | null {
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePositiveInt(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatCount(count: number, singular: string, plural: string): string {
  if (count === 0) return `Sin ${plural}`;
  return `${count} ${count === 1 ? singular : plural}`;
}

function composeInitialSpaceLabel(initialValues: AcademicFieldsProps["initialValues"]): string | undefined {
  const name = toOptionalFormString(initialValues?.academicSpaceName);
  if (!name) return undefined;
  const type = toOptionalFormString(initialValues?.academicSpaceType);
  const format = toOptionalFormString(initialValues?.academicSpaceFormat);
  const parts = [
    name,
    type ? academicSpaceTypeLabels[type as keyof typeof academicSpaceTypeLabels] : undefined,
    format ? academicSpaceFormatLabels[format as keyof typeof academicSpaceFormatLabels] : undefined,
  ].filter(Boolean);
  return parts.join(" · ");
}

type ClassCardProps = {
  courseClass: ClassDraft;
  fieldErrors?: Record<string, string>;
  format: string | undefined;
  institutionId: string | undefined;
  onRemove: () => void;
  onUpdate: (updater: (draft: ClassDraft) => ClassDraft) => void;
  scope: AcademicScope | undefined;
  title: string;
};

function ClassCard({ courseClass, fieldErrors, format, institutionId, onRemove, onUpdate, scope, title }: ClassCardProps): React.ReactElement {
  const teachersFieldId = React.useId();
  const classSummary = [formatCount(courseClass.teachers.length, "docente", "docentes"), formatCount(courseClass.days.length, "día", "días")].join(
    " · ",
  );

  function updateDays(values: string[]): void {
    const selectedDays = new Set(values.filter((value): value is CourseWeekDay => COURSE_WEEK_DAY.includes(value as CourseWeekDay)));
    onUpdate((draft) => ({
      ...draft,
      days: COURSE_WEEK_DAY.filter((day) => selectedDays.has(day)).map(
        (day) => draft.days.find((candidate) => candidate.dayOfWeek === day) ?? emptyDay(day),
      ),
    }));
  }

  return (
    <Card className="bg-background gap-0 py-0 shadow-xs">
      <CardHeader className="gap-0 border-b px-5 py-3.5 sm:px-6">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">{classSummary}</CardDescription>
        <CardAction className="self-center">
          <Button
            aria-label={`Eliminar ${title.toLowerCase()}`}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8"
            onClick={onRemove}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Trash2Icon />
            <span className="sr-only">Eliminar clase</span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 p-5 sm:p-6">
        {(() => {
          const teacherError = fieldErrors?.classes && courseClass.teachers.length === 0 ? "Seleccioná al menos un docente." : undefined;
          return (
            <FormField label="Docentes" name={teachersFieldId} error={teacherError} required>
              <div className="mt-1 flex flex-col gap-3">
                {courseClass.teachers.length > 0 ? (
                  <div className="bg-muted/20 flex flex-wrap gap-2 rounded-xl border px-3 py-2.5">
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
                ) : null}
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
                      if (!value || !item) return;
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
        })()}

        {(() => {
          const daysError = fieldErrors?.classes && courseClass.days.length === 0 ? "Seleccioná al menos un día con sus horarios." : undefined;
          return (
            <FormField label="Días de cursado" name={`days-${title}`} error={daysError} required>
              <ToggleGroup
                aria-label="Días de cursado"
                className="mt-1 flex w-full flex-wrap gap-2"
                onValueChange={updateDays}
                size="default"
                spacing={2}
                type="multiple"
                value={courseClass.days.map((day) => day.dayOfWeek)}
                variant="default"
              >
                {COURSE_WEEK_DAY.map((day) => (
                  <ToggleGroupItem
                    className="bg-primary/5 text-primary/80 hover:bg-primary/10 hover:text-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-9 min-w-[4.5rem] flex-1 rounded-lg border-0 px-2 text-sm font-medium transition-colors"
                    key={day}
                    value={day}
                  >
                    {WEEK_DAY_LABELS[day]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FormField>
          );
        })()}

        {courseClass.days.length > 0 ? (
          <div className="flex flex-col gap-4 pt-1">
            {courseClass.days.map((day) => (
              <DayEditor
                day={day}
                fieldErrors={fieldErrors}
                individual={individualFormat(format)}
                key={day.dayOfWeek}
                onUpdate={(updater) =>
                  onUpdate((draft) => ({
                    ...draft,
                    days: draft.days.map((candidate) => (candidate.dayOfWeek === day.dayOfWeek ? updater(candidate) : candidate)),
                  }))
                }
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DayEditor({
  day,
  fieldErrors,
  individual,
  onUpdate,
}: {
  day: DayDraft;
  fieldErrors?: Record<string, string>;
  individual: boolean;
  onUpdate: (updater: (draft: DayDraft) => DayDraft) => void;
}): React.ReactElement {
  const hasSubmitted = Boolean(fieldErrors?.classes);
  const periodError =
    hasSubmitted && individual && (!day.periodDurationMinutes || Number(day.periodDurationMinutes) <= 0)
      ? Number(day.periodDurationMinutes) <= 0 && day.periodDurationMinutes !== ""
        ? "La duración del período debe ser mayor a 0."
        : "Indicá la duración de cada período para los espacios individuales."
      : undefined;
  const capacityError = hasSubmitted && !individual && day.capacity !== "" && Number(day.capacity) <= 0 ? "El cupo debe ser mayor a 0." : undefined;

  // Per-schedule validation helpers
  function getScheduleError(scheduleIndex: number): string | undefined {
    if (!hasSubmitted) return undefined;
    const schedule = day.schedules[scheduleIndex];
    if (!schedule.startTime || !schedule.endTime) return "Completá todos los horarios.";
    const start = toMinutes(schedule.startTime);
    const end = toMinutes(schedule.endTime);
    if (start < 0 || end < 0 || start >= end) return "El horario que se quiere asignar es inválido.";
    // Only check overlap/divisibility if every schedule in this day is individually valid
    const allValid = day.schedules.every((candidate) => {
      if (!candidate.startTime || !candidate.endTime) return false;
      const candidateStart = toMinutes(candidate.startTime);
      const candidateEnd = toMinutes(candidate.endTime);
      return candidateStart >= 0 && candidateEnd >= 0 && candidateStart < candidateEnd;
    });
    if (!allValid) return undefined;
    const slots = day.schedules.map((candidate, candidateIndex) => ({
      index: candidateIndex,
      start: toMinutes(candidate.startTime),
      end: toMinutes(candidate.endTime),
    }));
    for (let otherIndex = 0; otherIndex < slots.length; otherIndex += 1) {
      if (otherIndex === scheduleIndex) continue;
      const other = slots[otherIndex];
      if (start < other.end && other.start < end) return "Los horarios del mismo día no pueden superponerse.";
    }
    if (individual && day.periodDurationMinutes) {
      const period = Number(day.periodDurationMinutes);
      if (period > 0) {
        const duration = end - start;
        if (duration % period !== 0) return "La duración total de los horarios debe ser divisible por la duración del período.";
      }
    }
    return undefined;
  }

  const dayLevelError = (() => {
    if (!hasSubmitted) return undefined;
    const validSchedules = day.schedules.filter((schedule) => {
      if (!schedule.startTime || !schedule.endTime) return false;
      const start = toMinutes(schedule.startTime);
      const end = toMinutes(schedule.endTime);
      return start >= 0 && end >= 0 && start < end;
    });
    if (validSchedules.length === 0) return undefined;
    const hasInvalidSchedules = day.schedules.some((_, index) => Boolean(getScheduleError(index)));
    if (hasInvalidSchedules) return undefined;
    const computedTotal = validSchedules.reduce((total, schedule) => total + (toMinutes(schedule.endTime) - toMinutes(schedule.startTime)), 0);
    if (computedTotal <= 0) return "Los horarios deben tener una duración mayor a 0.";
    return undefined;
  })();

  function updateSchedule(scheduleIndex: number, field: keyof ScheduleDraft, value: string): void {
    onUpdate((draft) => ({
      ...draft,
      schedules: draft.schedules.map((candidate, index) => (index === scheduleIndex ? { ...candidate, [field]: value } : candidate)),
    }));
  }

  return (
    <section className="bg-muted/10 overflow-hidden rounded-xl border">
      <header className="bg-muted/25 border-b p-4 sm:p-5">
        <div className="flex items-center gap-3.5">
          <span className="bg-background text-primary flex size-10 items-center justify-center rounded-xl border shadow-xs">
            <CalendarDaysIcon className="size-5" />
          </span>
          <div>
            <h5 className="text-base font-semibold">{WEEK_DAY_LABELS[day.dayOfWeek]}</h5>
            <p className="text-muted-foreground text-sm">
              {day.schedules.length} {day.schedules.length === 1 ? "franja horaria" : "franjas horarias"}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-4 sm:p-5">
        {individual ? (
          <FormField label="Duración del período" name={`period-${day.dayOfWeek}`} error={periodError} className="w-full flex-[1_0_100%]" required>
            <div
              className={cn(
                "border-input bg-background focus-within:border-ring focus-within:ring-ring/50 flex h-9 w-full items-center overflow-hidden rounded-lg border shadow-2xs transition focus-within:ring-3",
                periodError && "border-destructive ring-destructive/20",
              )}
            >
              <NumericInput
                aria-invalid={Boolean(periodError)}
                aria-label={`Duración del período en minutos para ${WEEK_DAY_LABELS[day.dayOfWeek]}`}
                className="h-full w-full border-0 bg-transparent px-3 text-sm tabular-nums shadow-none focus-visible:ring-0"
                id={`period-${day.dayOfWeek}`}
                maxLength={4}
                onChange={(event) => {
                  const nextValue = event.currentTarget.value;
                  onUpdate((draft) => ({ ...draft, periodDurationMinutes: nextValue }));
                }}
                value={day.periodDurationMinutes}
              />
              <span className="bg-muted/40 text-muted-foreground flex h-full items-center border-l px-3 text-xs font-medium select-none">
                minutos
              </span>
            </div>
          </FormField>
        ) : (
          <FormField className="w-full flex-[1_0_100%]" label="Cupo (opcional)" name={`capacity-${day.dayOfWeek}`} error={capacityError}>
            <NumericInput
              aria-invalid={Boolean(capacityError)}
              className="bg-background h-9 w-full"
              id={`capacity-${day.dayOfWeek}`}
              maxLength={5}
              onChange={(event) => {
                const nextValue = event.currentTarget.value;
                onUpdate((draft) => ({ ...draft, capacity: nextValue }));
              }}
              placeholder="Sin límite"
              value={day.capacity}
            />
          </FormField>
        )}
        <FormField label="Franjas horarias" name={`schedules-${day.dayOfWeek}`} error={dayLevelError} required className="w-full">
          <div className="flex flex-col gap-3.5 pt-1">
            {day.schedules.map((schedule, index) => {
              const scheduleError = getScheduleError(index);
              return (
                <ScheduleRangeEditor
                  canRemove={day.schedules.length > 1}
                  dayLabel={WEEK_DAY_LABELS[day.dayOfWeek]}
                  index={index}
                  individual={individual}
                  key={index}
                  onEndTimeChange={(value) => updateSchedule(index, "endTime", value)}
                  onRemove={() =>
                    onUpdate((draft) => ({
                      ...draft,
                      schedules: draft.schedules.filter((_, scheduleIndex) => scheduleIndex !== index),
                    }))
                  }
                  onStartTimeChange={(value) => updateSchedule(index, "startTime", value)}
                  periodDurationMinutes={day.periodDurationMinutes}
                  schedule={schedule}
                  scheduleError={scheduleError}
                />
              );
            })}
            <Button
              className="bg-primary/5 text-primary/80 hover:bg-primary/10 hover:text-primary h-10 w-full rounded-lg border-0 font-medium transition-colors"
              onClick={() => onUpdate((draft) => ({ ...draft, schedules: [...draft.schedules, emptySchedule()] }))}
              type="button"
              variant="ghost"
            >
              <PlusIcon data-icon="inline-start" /> Agregar otra franja horaria
            </Button>
          </div>
        </FormField>
      </div>
    </section>
  );
}

type ScheduleRangeEditorProps = {
  canRemove: boolean;
  dayLabel: string;
  index: number;
  individual: boolean;
  onEndTimeChange: (value: string) => void;
  onRemove: () => void;
  onStartTimeChange: (value: string) => void;
  periodDurationMinutes: string;
  schedule: ScheduleDraft;
  scheduleError: string | undefined;
};

function ScheduleRangeEditor({
  canRemove,
  dayLabel,
  index,
  individual,
  onEndTimeChange,
  onRemove,
  onStartTimeChange,
  periodDurationMinutes,
  schedule,
  scheduleError,
}: ScheduleRangeEditorProps): React.ReactElement {
  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);
  const isEmpty = !schedule.startTime && !schedule.endTime;
  const isIncomplete = !schedule.startTime || !schedule.endTime;
  const isValid = !isIncomplete && start >= 0 && end >= 0 && start < end;
  const duration = isValid ? end - start : 0;
  const period = parsePositiveInt(periodDurationMinutes);
  const isDivisible = Boolean(period && duration % period === 0);

  return (
    <div className="bg-background rounded-xl border p-4 shadow-2xs">
      <div className="mb-3.5 flex min-h-8 flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold">Franja {index + 1}</span>
          {!isEmpty && !isValid ? <Badge variant="destructive">{isIncomplete ? "Incompleta" : "Inválida"}</Badge> : null}
          {isValid ? <Badge variant="outline">{duration} min</Badge> : null}
          {individual && isValid && period ? (
            <Badge variant={isDivisible ? "success" : "destructive"}>{isDivisible ? `${duration / period} cupos` : "No divisible"}</Badge>
          ) : null}
        </div>
        {canRemove ? (
          <Button
            aria-label={`Quitar franja ${index + 1} de ${dayLabel}`}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-8"
            onClick={onRemove}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Trash2Icon />
          </Button>
        ) : null}
      </div>

      <div
        className={cn(
          "border-input bg-muted/10 focus-within:bg-background focus-within:border-ring focus-within:ring-ring/50 grid grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] overflow-hidden rounded-xl border shadow-2xs transition focus-within:ring-3",
          scheduleError && "border-destructive ring-destructive/20",
        )}
      >
        <div className="min-w-0 px-4 py-3">
          <label className="text-muted-foreground mb-1 block text-sm font-medium" htmlFor={`schedule-${dayLabel}-${index}-start`}>
            Desde
          </label>
          <TimeInput
            aria-invalid={Boolean(scheduleError)}
            aria-label={`Inicio ${dayLabel} ${index + 1}`}
            className="h-8 border-0 bg-transparent px-0 text-base font-semibold tabular-nums shadow-none focus-visible:ring-0"
            id={`schedule-${dayLabel}-${index}-start`}
            onChange={(event) => onStartTimeChange(event.currentTarget.value)}
            value={schedule.startTime}
          />
        </div>
        <div className="bg-muted/30 text-muted-foreground flex items-center justify-center border-x">
          <ArrowRightIcon className="size-4" />
        </div>
        <div className="min-w-0 px-4 py-3">
          <label className="text-muted-foreground mb-1 block text-sm font-medium" htmlFor={`schedule-${dayLabel}-${index}-end`}>
            Hasta
          </label>
          <TimeInput
            aria-invalid={Boolean(scheduleError)}
            aria-label={`Fin ${dayLabel} ${index + 1}`}
            className="h-8 border-0 bg-transparent px-0 text-base font-semibold tabular-nums shadow-none focus-visible:ring-0"
            id={`schedule-${dayLabel}-${index}-end`}
            onChange={(event) => onEndTimeChange(event.currentTarget.value)}
            value={schedule.endTime}
          />
        </div>
      </div>
      {scheduleError ? <p className="text-destructive mt-2 text-xs">{scheduleError}</p> : null}
    </div>
  );
}
