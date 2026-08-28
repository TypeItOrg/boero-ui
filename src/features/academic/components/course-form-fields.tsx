"use client";

import * as React from "react";
import { ClockIcon, GraduationCapIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Input } from "@common/components/ui/input";
import { NumericInput, TimeInput } from "@common/components/ui/restricted-input";
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

export function CourseFields({ institutionId, scope, initialValues = {}, fieldErrors }: AcademicFieldsProps): React.ReactElement {
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
        schedules: day.schedules.filter((schedule) => schedule.startTime && schedule.endTime),
      })),
    })),
  );

  return (
    <div className="flex w-full flex-wrap gap-4">
      <input type="hidden" name="studyPlanId" value={studyPlanId ?? ""} />
      <input type="hidden" name="academicSpaceId" value={spaceId ?? ""} />
      <input type="hidden" name="academicYearId" value={academicYearId ?? ""} />
      <input type="hidden" name="format" value={format ?? ""} />
      <input type="hidden" name="classes" value={serializedClasses} />

      <FormField label="Plan de estudio" name="studyPlanId" error={fieldErrors?.studyPlanId} className="w-full flex-[1_0_100%]" required>
        {institutionId && scope ? (
          <AsyncDropdown<{ id: string; name: string }>
            ariaInvalid={Boolean(fieldErrors?.studyPlanId)}
            disabled={editing || classesLocked}
            emptyMessage="No se encontraron planes activos."
            errorMessage="No se pudieron cargar los planes de estudio."
            fetchPage={(input) =>
              fetchAcademicOptionPage<{ id: string; name: string }>("study-plans", scope, institutionId, input, { active: "all", status: "ACTIVE" })
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
            searchPlaceholder="Buscar plan..."
            selectedLabel={toOptionalFormString(initialValues.studyPlanName)}
            value={studyPlanId}
          />
        ) : (
          <Input disabled placeholder="Seleccioná una institución primero" type="text" />
        )}
      </FormField>

      <FormField label="Espacio académico" name="academicSpaceId" error={fieldErrors?.academicSpaceId} className="w-full flex-[1_0_100%]" required>
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
              searchPlaceholder="Buscar espacio..."
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
            placeholder="Seleccionar ciclo lectivo"
            queryKey={["courses", "academic-years", scope, institutionId]}
            searchPlaceholder="Buscar año..."
            selectedLabel={initialValues.year !== undefined ? String(initialValues.year) : undefined}
            value={academicYearId}
          />
        ) : (
          <Input disabled placeholder="Seleccioná una institución primero" type="text" />
        )}
      </FormField>

      <section className="bg-muted/25 w-full flex-[1_0_100%] rounded-xl border p-4">
        <header className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Clases del curso</h3>
          <Button
            disabled={!spaceId}
            onClick={() => setClasses((current) => [...current, { teachers: [], days: [] }])}
            size="sm"
            type="button"
            variant="outline"
          >
            <PlusIcon className="size-4" /> Agregar clase
          </Button>
        </header>

        {classes.length === 0 ? (
          <p className="text-muted-foreground mt-4 text-sm">
            Todavía no agregaste clases. Elegí el plan y el espacio académico para habilitar su creación.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
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
    </div>
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
  function toggleDay(dayOfWeek: CourseWeekDay): void {
    onUpdate((draft) => {
      const exists = draft.days.some((day) => day.dayOfWeek === dayOfWeek);
      return {
        ...draft,
        days: exists ? draft.days.filter((day) => day.dayOfWeek !== dayOfWeek) : [...draft.days, emptyDay(dayOfWeek)],
      };
    });
  }

  return (
    <article className="bg-background rounded-lg border p-4">
      <header className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <GraduationCapIcon className="text-primary size-4" /> {title}
        </h4>
        <Button onClick={onRemove} size="icon" type="button" variant="ghost">
          <Trash2Icon className="text-destructive size-4" />
          <span className="sr-only">Eliminar clase</span>
        </Button>
      </header>

      <div className="mt-4 flex flex-col gap-4">
        {(() => {
          const teacherError = fieldErrors?.classes && courseClass.teachers.length === 0 ? "Seleccioná al menos un docente." : undefined;
          return (
            <FormField label="Docentes" name={`teachers-${title}`} error={teacherError} required>
              <div className="flex flex-wrap items-center gap-2">
                {courseClass.teachers.map((teacher) => (
                  <span className="bg-secondary inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs" key={teacher.personId}>
                    {teacher.fullName}
                    <button
                      onClick={() =>
                        onUpdate((draft) => ({
                          ...draft,
                          teachers: draft.teachers.filter((candidate) => candidate.personId !== teacher.personId),
                        }))
                      }
                      type="button"
                      aria-label={`Quitar a ${teacher.fullName}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {institutionId && scope ? (
                  <AsyncDropdown<CourseTeacherOption>
                    ariaInvalid={Boolean(teacherError)}
                    emptyMessage="No se encontraron docentes."
                    errorMessage="No se pudieron cargar los docentes."
                    fetchPage={(input) => fetchCourseTeacherOptions(scope, institutionId, input)}
                    getItemLabel={(item) => item.fullName}
                    getItemValue={(item) => item.id}
                    name={`teachers-${title}`}
                    onValueChange={(value, item) => {
                      if (!value || !item) return;
                      onUpdate((draft) =>
                        draft.teachers.some((teacher) => teacher.personId === value)
                          ? draft
                          : { ...draft, teachers: [...draft.teachers, { personId: item.id, fullName: item.fullName }] },
                      );
                    }}
                    placeholder="Agregar docente..."
                    queryKey={["courses", "teachers", scope, institutionId]}
                    searchPlaceholder="Buscar docente..."
                    value=""
                  />
                ) : null}
              </div>
            </FormField>
          );
        })()}

        {(() => {
          const daysError = fieldErrors?.classes && courseClass.days.length === 0 ? "Seleccioná al menos un día con sus horarios." : undefined;
          return (
            <FormField label="Días" name={`days-${title}`} error={daysError} required>
              <div className="flex flex-wrap gap-2">
                {COURSE_WEEK_DAY.map((day) => {
                  const active = courseClass.days.some((candidate) => candidate.dayOfWeek === day);
                  return (
                    <button
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        active ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent",
                      )}
                      key={day}
                      onClick={() => toggleDay(day)}
                      type="button"
                    >
                      {WEEK_DAY_LABELS[day]}
                    </button>
                  );
                })}
              </div>
            </FormField>
          );
        })()}

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
    </article>
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
      if (start <= other.end && other.start <= end) return "Los horarios del mismo día no pueden superponerse.";
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

  return (
    <div className="rounded-md border p-3">
      <div className="flex flex-col gap-3">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <ClockIcon className="size-3.5" /> {WEEK_DAY_LABELS[day.dayOfWeek]}
        </span>
        {individual ? (
          <FormField label="Duración del período (minutos)" name={`period-${day.dayOfWeek}`} error={periodError} required className="w-full">
            <NumericInput
              aria-invalid={Boolean(periodError)}
              className="h-8 w-full"
              id={`period-${day.dayOfWeek}`}
              maxLength={4}
              onChange={(event) => {
                const nextValue = event.currentTarget.value;
                onUpdate((draft) => ({ ...draft, periodDurationMinutes: nextValue }));
              }}
              value={day.periodDurationMinutes}
            />
          </FormField>
        ) : (
          <FormField label="Cupo (opcional)" name={`capacity-${day.dayOfWeek}`} error={capacityError} className="w-full">
            <NumericInput
              aria-invalid={Boolean(capacityError)}
              className="h-8 w-full"
              id={`capacity-${day.dayOfWeek}`}
              maxLength={5}
              onChange={(event) => {
                const nextValue = event.currentTarget.value;
                onUpdate((draft) => ({ ...draft, capacity: nextValue }));
              }}
              value={day.capacity}
            />
          </FormField>
        )}

        <FormField label="Horarios" name={`schedules-${day.dayOfWeek}`} error={dayLevelError} required className="w-full">
          <div className="flex flex-col gap-2">
            {day.schedules.map((schedule, index) => {
              const scheduleError = getScheduleError(index);
              return (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <TimeInput
                      aria-label={`Inicio ${WEEK_DAY_LABELS[day.dayOfWeek]} ${index + 1}`}
                      aria-invalid={Boolean(scheduleError)}
                      onChange={(event) => {
                        const nextValue = event.currentTarget.value;
                        onUpdate((draft) => ({
                          ...draft,
                          schedules: draft.schedules.map((candidate, scheduleIndex) =>
                            scheduleIndex === index ? { ...candidate, startTime: nextValue } : candidate,
                          ),
                        }));
                      }}
                      value={schedule.startTime}
                    />
                    <span className="text-muted-foreground text-xs">a</span>
                    <TimeInput
                      aria-label={`Fin ${WEEK_DAY_LABELS[day.dayOfWeek]} ${index + 1}`}
                      aria-invalid={Boolean(scheduleError)}
                      onChange={(event) => {
                        const nextValue = event.currentTarget.value;
                        onUpdate((draft) => ({
                          ...draft,
                          schedules: draft.schedules.map((candidate, scheduleIndex) =>
                            scheduleIndex === index ? { ...candidate, endTime: nextValue } : candidate,
                          ),
                        }));
                      }}
                      value={schedule.endTime}
                    />
                    {individual
                      ? (() => {
                          const start = toMinutes(schedule.startTime);
                          const end = toMinutes(schedule.endTime);
                          const isInvalid = !schedule.startTime || !schedule.endTime || start < 0 || end < 0 || start >= end;
                          if (isInvalid) {
                            return (
                              <span className="flex min-w-[95px] flex-col items-center justify-center text-center text-xs leading-none">
                                <span className="text-destructive whitespace-nowrap">Inválido</span>
                              </span>
                            );
                          }
                          const duration = end - start;
                          const period = parsePositiveInt(day.periodDurationMinutes);
                          const isDivisible = period ? duration % period === 0 : false;
                          return (
                            <span className="flex min-w-[95px] flex-col items-center justify-center text-center text-xs leading-none">
                              <span className="text-muted-foreground text-center whitespace-nowrap">{duration} minutos</span>
                              <span
                                className={cn(
                                  "text-center whitespace-nowrap",
                                  period ? (isDivisible ? "text-muted-foreground" : "text-destructive") : "text-muted-foreground",
                                )}
                              >
                                {period ? (isDivisible ? `${duration / period} cupos` : "Indivisible") : ""}
                              </span>
                            </span>
                          );
                        })()
                      : null}
                    {day.schedules.length > 1 ? (
                      <Button
                        onClick={() =>
                          onUpdate((draft) => ({
                            ...draft,
                            schedules: draft.schedules.filter((_, scheduleIndex) => scheduleIndex !== index),
                          }))
                        }
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2Icon className="size-3.5" />
                        <span className="sr-only">Quitar horario</span>
                      </Button>
                    ) : null}
                  </div>
                  {scheduleError ? <p className="text-destructive text-xs">{scheduleError}</p> : null}
                </div>
              );
            })}
            <Button
              className="self-start"
              onClick={() => onUpdate((draft) => ({ ...draft, schedules: [...draft.schedules, emptySchedule()] }))}
              size="sm"
              type="button"
              variant="ghost"
            >
              <PlusIcon className="size-3.5" /> Agregar horario
            </Button>
          </div>
        </FormField>
      </div>
    </div>
  );
}
