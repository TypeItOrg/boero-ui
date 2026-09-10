import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpenCheckIcon, CalendarDaysIcon, CalendarIcon, ClockIcon, InfoIcon, TimerIcon, UserIcon, UsersIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { cn } from "@common/utils/cn.util";
import { formatDisplayDate } from "@common/utils/date-input.util";
import { AcademicSpaceUsage, AcademicSpaceUsageWarning } from "@features/academic/components/academic-space-usage";
import { StudyPlanSpaceDetail } from "@features/academic/components/study-plan-space-detail";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import type { AcademicSpaceUsage as AcademicSpaceUsageData } from "@features/academic/types/academic-space-usage.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import { getAcademicDetailInfo } from "@features/academic/utils/academic-detail-fields.util";
import type { Course } from "@features/academic/types/course.types";
import {
  academicSpaceFormatLabels,
  academicSpaceTypeLabels,
  courseStatusLabels,
  courseWeekDayLabels,
  studyPlanStatusLabels,
} from "@features/academic/utils/academic-labels.util";

export { StudyPlanSpaceDetail };

type AcademicDetailProps = {
  item: AcademicCollection;
  resource: AcademicCollectionResource;
  basePath: string;
  canEdit: boolean;
  academicSpaceUsage?: AcademicSpaceUsageData | null;
  statusAction?: ReactNode;
  versionAction?: ReactNode;
  returnTo?: string;
};

export function AcademicDetail({
  item,
  resource,
  basePath,
  canEdit,
  academicSpaceUsage,
  statusAction,
  versionAction,
  returnTo,
}: AcademicDetailProps): React.ReactElement {
  const destination = returnTo ?? `${basePath}/${resource}`;
  const detailPath = `${basePath}/${resource}/${item.id}`;

  const headerActions = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button asChild size="lg" variant="outline">
        <Link href={destination}>Volver</Link>
      </Button>
      {canEdit || statusAction || versionAction ? (
        <div className="flex flex-wrap items-center gap-2">
          {canEdit ? (
            <Button asChild size="lg">
              <ReturnToLink href={`${detailPath}/edit`}>Editar</ReturnToLink>
            </Button>
          ) : null}
          {versionAction}
          {statusAction}
        </div>
      ) : null}
    </div>
  );

  if (resource === AcademicResource.STUDY_PLAN) {
    return (
      <div className="flex flex-col gap-4">
        {headerActions}
        <StudyPlanSummary plan={item as StudyPlan} />
      </div>
    );
  }

  if (resource === AcademicResource.COURSE) {
    return (
      <div className="flex flex-col gap-4">
        {headerActions}
        <CourseSummary course={item as Course} />
      </div>
    );
  }

  const detail = getAcademicDetailInfo(resource, item);
  const academicSpaceWarning =
    resource === AcademicResource.ACADEMIC_SPACE && academicSpaceUsage?.summary.deactivationBlocked ? (
      <AcademicSpaceUsageWarning blockingPlanCount={academicSpaceUsage.summary.activePlans + academicSpaceUsage.summary.draftPlans} />
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      {headerActions}
      {academicSpaceWarning}
      <section aria-labelledby="academic-detail-info-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="border-b pb-5">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
              <InfoIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="academic-detail-info-title" className="text-base font-semibold">
                Información
              </h2>
              <p className="text-muted-foreground text-sm">{detail.description}</p>
            </div>
          </div>
        </header>
        <div className={cn("mt-5 grid gap-4", detail.gridColsClass ?? "sm:grid-cols-2")}>
          {detail.fields.map((field) => (
            <div key={field.label} className={cn("bg-background rounded-lg border p-4", field.className)}>
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{field.label}</p>
              <div className="mt-1 font-medium">{field.value}</div>
            </div>
          ))}
        </div>
      </section>
      {resource === AcademicResource.ACADEMIC_SPACE && academicSpaceUsage ? (
        <AcademicSpaceUsage basePath={basePath} usage={academicSpaceUsage} />
      ) : null}
    </div>
  );
}

function StudyPlanSummary({ plan }: { plan: StudyPlan }): React.ReactElement {
  return (
    <section aria-labelledby="study-plan-summary-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
            <BookOpenCheckIcon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="study-plan-summary-title" className="text-base font-semibold">
              Resumen
            </h2>
            <p className="text-muted-foreground text-sm">Consultá el trayecto formativo, el estado y el período de vigencia del plan.</p>
          </div>
        </div>
      </header>

      <dl className="grid gap-5 pt-5 sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground text-sm">Trayecto formativo</dt>
          <dd className="mt-1 font-semibold">{plan.trainingPathName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Estado</dt>
          <dd className="mt-1">
            <Badge variant={plan.status === "ACTIVE" ? "success" : "secondary"}>{studyPlanStatusLabels[plan.status]}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Vigencia</dt>
          <dd className="mt-1 font-semibold tabular-nums">{formatStudyPlanValidity(plan)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">Versión</dt>
          <dd className="mt-1 font-semibold">{plan.versionNumber ?? 1}</dd>
        </div>
      </dl>
    </section>
  );
}

function CourseSummary({ course }: { course: Course }): React.ReactElement {
  return (
    <>
      <section aria-labelledby="course-summary-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <BookOpenCheckIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="course-summary-title" className="text-base font-semibold">
                Información del curso
              </h2>
              <p className="text-muted-foreground text-sm">Consultá el espacio instanciado, su plan y el ciclo lectivo.</p>
            </div>
          </div>
        </header>

        <dl className="grid gap-5 pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground text-sm">Trayecto formativo</dt>
            <dd className="mt-1 font-semibold">{course.trainingPathName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Plan de estudio</dt>
            <dd className="mt-1 font-semibold">{course.studyPlanName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Ciclo lectivo</dt>
            <dd className="mt-1 font-semibold tabular-nums">{course.year}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-sm">Espacio académico</dt>
            <dd className="mt-1 font-semibold">
              {course.academicSpaceName} · {academicSpaceTypeLabels[course.academicSpaceType]} ·{" "}
              {academicSpaceFormatLabels[course.academicSpaceFormat]}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Estado</dt>
            <dd className="mt-1">
              <Badge
                variant={
                  (course.status ?? (course.active ? "ACTIVE" : "INACTIVE")) === "ACTIVE"
                    ? "success"
                    : (course.status ?? (course.active ? "ACTIVE" : "INACTIVE")) === "CLOSED"
                      ? "outline"
                      : "secondary"
                }
              >
                {courseStatusLabels[course.status as keyof typeof courseStatusLabels] ?? (course.active ? "Activo" : "Inactivo")}
              </Badge>
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="course-classes-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <CalendarDaysIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="course-classes-title" className="text-base font-semibold">
                Clases
              </h2>
              <p className="text-muted-foreground text-sm">
                {course.classes.length === 0
                  ? "Este curso aún no tiene clases registradas."
                  : `${course.classes.length} ${course.classes.length === 1 ? "clase registrada" : "clases registradas"}.`}
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-4 pt-5">
          {course.classes.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin clases para mostrar.</p>
          ) : (
            course.classes.map((courseClass, classIndex) => (
              <article key={courseClass.id} className="bg-background overflow-hidden rounded-xl border shadow-2xs">
                <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg text-sm font-bold">
                      {classIndex + 1}
                    </span>
                    <div>
                      <h3 className="text-base leading-none font-semibold">Clase {classIndex + 1}</h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {courseClass.days.length === 0
                          ? "Sin días configurados"
                          : `${courseClass.days.length} ${courseClass.days.length === 1 ? "día de cursado" : "días de cursado"}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {courseClass.teachers.length === 0 ? (
                      <span className="text-muted-foreground text-xs italic">Sin docentes asignados</span>
                    ) : (
                      courseClass.teachers.map((teacher) => (
                        <Badge key={teacher.personId} variant="secondary" className="h-8 gap-2 px-3 text-xs font-medium sm:text-sm [&>svg]:size-4!">
                          <UserIcon className="text-muted-foreground" aria-hidden="true" />
                          <span>{teacher.fullName}</span>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-5">
                  {courseClass.days.length === 0 ? (
                    <p className="text-muted-foreground text-sm italic">Sin días configurados para esta clase.</p>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {courseClass.days.map((day) => (
                        <div
                          key={day.dayOfWeek}
                          className="bg-muted/15 hover:bg-muted/25 rounded-xl border px-4 py-3 transition-colors sm:px-5 sm:py-3.5"
                        >
                          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <div className="flex items-center gap-2">
                                <div className="bg-background flex size-8 items-center justify-center rounded-lg border shadow-2xs">
                                  <CalendarIcon className="text-primary size-4" aria-hidden="true" />
                                </div>
                                <span className="text-foreground text-sm font-semibold sm:text-base">{courseWeekDayLabels[day.dayOfWeek]}</span>
                              </div>

                              <span className="text-muted-foreground/40 hidden select-none sm:inline" aria-hidden="true">
                                •
                              </span>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {day.schedules.length === 0 ? (
                                  <span className="text-muted-foreground text-xs italic sm:text-sm">Sin horarios configurados</span>
                                ) : (
                                  day.schedules.map((schedule, scheduleIndex) => (
                                    <Badge
                                      key={scheduleIndex}
                                      variant="outline"
                                      className="bg-background text-foreground h-8 gap-1.5 px-3 text-xs font-medium tabular-nums shadow-2xs sm:text-sm [&>svg]:size-4!"
                                    >
                                      <ClockIcon className="text-muted-foreground" aria-hidden="true" />
                                      <span>
                                        {schedule.startTime.slice(0, 5)} — {schedule.endTime.slice(0, 5)}
                                      </span>
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {day.periodDurationMinutes != null ? (
                                <Badge
                                  variant="outline"
                                  className="bg-background h-8 gap-1.5 px-3 text-xs font-normal shadow-2xs sm:text-sm [&>svg]:size-4!"
                                >
                                  <TimerIcon className="text-primary" aria-hidden="true" />
                                  <span className="text-muted-foreground">
                                    Período: <strong className="text-foreground font-semibold tabular-nums">{day.periodDurationMinutes} min</strong>
                                  </span>
                                </Badge>
                              ) : null}

                              <Badge
                                variant="outline"
                                className="bg-background h-8 gap-1.5 px-3 text-xs font-normal shadow-2xs sm:text-sm [&>svg]:size-4!"
                              >
                                <UsersIcon className="text-primary" aria-hidden="true" />
                                <span className="text-muted-foreground">
                                  Cupo:{" "}
                                  <strong className="text-foreground font-semibold tabular-nums">
                                    {day.capacity != null ? day.capacity : "Sin límite"}
                                  </strong>
                                </span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}

function formatStudyPlanValidity({ effectiveFrom, effectiveTo }: Pick<StudyPlan, "effectiveFrom" | "effectiveTo">): string {
  if (!effectiveFrom && !effectiveTo) return "Sin período definido";

  if (effectiveFrom && !effectiveTo) return `Desde ${formatDisplayDate(effectiveFrom)}`;

  if (!effectiveFrom && effectiveTo) return `Hasta ${formatDisplayDate(effectiveTo)}`;

  return `${formatDisplayDate(effectiveFrom)} — ${formatDisplayDate(effectiveTo)}`;
}
