import type { ReactElement } from "react";

import { CalendarDaysIcon, CalendarIcon, ClockIcon, TimerIcon, UserIcon, UsersIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Badge } from "@common/components/ui/badge";

import type { Course } from "@features/academic/types/course.types";
import { courseWeekDayLabels } from "@features/academic/utils/academic-labels.util";

export function CourseClassesSummary({ course }: { course: Course }): ReactElement {
  return (
    <section aria-labelledby="course-classes-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={CalendarDaysIcon}
          title="Clases"
          description={
            course.classes.length === 0
              ? "Este curso aún no tiene clases registradas."
              : `${course.classes.length} ${course.classes.length === 1 ? "clase registrada" : "clases registradas"}.`
          }
          titleId="course-classes-title"
        />
      </header>

      <div className="flex flex-col gap-4 pt-5">
        {course.classes.length === 0 ? (
          <p className="text-muted-foreground text-sm">Sin clases para mostrar.</p>
        ) : (
          course.classes.map((courseClass) => (
            <article key={courseClass.id} className="bg-background overflow-hidden rounded-xl border shadow-2xs">
              <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg text-sm font-bold">
                    {courseClass.classNumber}
                  </span>
                  <div>
                    <h3 className="text-base leading-none font-semibold">Clase {courseClass.classNumber}</h3>
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
                                      {schedule.startTime.slice(0, 5)} a {schedule.endTime.slice(0, 5)}
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
  );
}
