"use client";

import { useState } from "react";

import { CalendarRangeIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { MySubjectsSkeleton } from "@features/course-enrollments/components/my-subjects-skeleton";
import { getScheduleWeek, isScheduleDate, shiftScheduleWeek } from "@features/course-enrollments/utils/schedule-week.util";
import { cn } from "@common/utils/cn.util";
import { MyScheduleEvent } from "@features/course-enrollments/components/my-schedule-event";
import { COURSE_DAY_LABELS } from "@features/course-enrollments/constants/course-enrollment.constants";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";

export function MyWeeklySchedule({
  enrollments,
  referenceDate,
  weekStart,
}: {
  enrollments: CourseEnrollment[];
  referenceDate: string;
  weekStart: string;
}): React.ReactElement {
  const schedules = enrollments.flatMap((enrollment) => enrollment.schedules.map((schedule) => ({ enrollment, schedule })));

  const [selectedDay, setSelectedDay] = useState(schedules[0]?.schedule.dayOfWeek ?? "MONDAY");

  const { isPending, navigate } = useDataTableNavigation();
  const currentWeek = getScheduleWeek(undefined, referenceDate);
  const previousWeek = shiftScheduleWeek(weekStart, -1);
  const nextWeek = shiftScheduleWeek(weekStart, 1);

  const startMinutes = schedules.map(({ schedule }) => toMinutes(schedule.startTime));
  const endMinutes = schedules.map(({ schedule }) => toMinutes(schedule.endTime));
  const firstHour = Math.max(0, Math.floor(Math.min(...(startMinutes.length > 0 ? startMinutes : [9 * 60])) / 60) - 1);
  const lastHour = Math.min(24, Math.max(firstHour + 4, Math.ceil(Math.max(...(endMinutes.length > 0 ? endMinutes : [13 * 60])) / 60) + 1));
  const hours = Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index);
  const calendarHeight = hours.length * 120;
  const totalMinutes = hours.length * 60;
  const monday = new Date(`${weekStart}T00:00:00Z`);
  const dates = Object.keys(COURSE_DAY_LABELS).map((_, index) => {
    const date = new Date(monday);
    date.setUTCDate(date.getUTCDate() + index);
    return date;
  });
  const monthFormatter = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "UTC" });
  const firstMonth = monthFormatter.format(dates[0]);
  const lastMonth = monthFormatter.format(dates[6]);
  const monthLabel = firstMonth === lastMonth ? firstMonth : `${firstMonth} – ${lastMonth}`;
  const shortDateFormatter = new Intl.DateTimeFormat("es-AR", { month: "long", timeZone: "UTC" });
  const startMonth = shortDateFormatter.format(dates[0]);
  const endMonth = shortDateFormatter.format(dates[6]);
  const weekLabel =
    startMonth === endMonth
      ? `${dates[0].getUTCDate()} – ${dates[6].getUTCDate()} de ${endMonth}`
      : `${dates[0].getUTCDate()} de ${startMonth} – ${dates[6].getUTCDate()} de ${endMonth}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4" aria-busy={isPending}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0" aria-live="polite">
          <h2 className="text-lg leading-6 font-semibold first-letter:uppercase">{monthLabel}</h2>
          <p className="text-muted-foreground text-sm leading-5">{weekLabel}</p>
        </div>
        <nav
          aria-label="Navegar entre semanas"
          className="grid w-full shrink-0 grid-cols-3 items-center gap-2 @lg/page-shell:w-auto @lg/page-shell:grid-cols-[2.25rem_auto_2.25rem] [&>button]:w-full"
        >
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Semana anterior"
            disabled={isPending || !isScheduleDate(previousWeek)}
            onClick={() => navigate({ week: previousWeek })}
          >
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isPending || currentWeek === weekStart}
            onClick={() => navigate({ week: undefined })}
          >
            Hoy
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Semana siguiente"
            disabled={isPending || !isScheduleDate(nextWeek)}
            onClick={() => navigate({ week: nextWeek })}
          >
            <ChevronRightIcon aria-hidden="true" />
          </Button>
        </nav>
      </div>
      <nav aria-label="Día de la semana" className="bg-muted grid grid-cols-7 gap-1 rounded-lg p-1 @4xl/page-shell:hidden">
        {Object.entries(COURSE_DAY_LABELS).map(([day, label], index) => (
          <button
            key={day}
            type="button"
            aria-label={`${label} ${dates[index].getUTCDate()}`}
            aria-pressed={selectedDay === day}
            disabled={isPending}
            onClick={() => setSelectedDay(day)}
            className={cn(
              "focus-visible:ring-ring flex min-h-12 min-w-0 flex-col items-center justify-center rounded-md text-xs focus-visible:ring-2 focus-visible:outline-none",
              selectedDay === day ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>{label.slice(0, 3)}</span>
            <span className="mt-1 font-semibold tabular-nums">{dates[index].getUTCDate()}</span>
          </button>
        ))}
      </nav>
      {isPending ? (
        <MySubjectsSkeleton />
      ) : schedules.length === 0 ? (
        <Empty className="bg-muted/25 min-h-56 flex-1 rounded-lg border border-solid px-4 py-12">
          <EmptyHeader className="max-w-md">
            <EmptyMedia variant="icon">
              <CalendarRangeIcon className="size-5" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="mt-2 text-base">No tenés clases programadas esta semana</EmptyTitle>
            <EmptyDescription>
              Podés recorrer las semanas para consultar los horarios de tus materias o volver a la semana actual con el botón «Hoy».
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div
          role="region"
          aria-label="Calendario semanal de clases"
          tabIndex={0}
          className="bg-muted/25 focus-visible:ring-ring flex min-h-80 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border focus-visible:ring-2 focus-visible:outline-none"
        >
          <div
            className="grid min-w-0 flex-1 grid-cols-[3.5rem_minmax(0,1fr)] @4xl/page-shell:grid-cols-[4.5rem_repeat(7,minmax(0,1fr))]"
            style={{ minHeight: calendarHeight + 72, gridTemplateRows: "72px minmax(0, 1fr)" }}
          >
            <div className="bg-background text-muted-foreground sticky top-0 left-0 z-30 flex items-center justify-center border-r border-b py-4 text-xs"></div>
            {Object.entries(COURSE_DAY_LABELS).map(([day, label], index) => (
              <h2
                key={day}
                className={cn(
                  "bg-background sticky top-0 z-20 border-b px-2 py-4 text-center text-sm font-semibold @4xl/page-shell:border-r @4xl/page-shell:last:border-r-0",
                  selectedDay !== day && "hidden @4xl/page-shell:block",
                )}
              >
                <span className="text-muted-foreground block text-xs font-medium">{label}</span>
                <time dateTime={dates[index].toISOString().slice(0, 10)} className="mt-1 block text-lg tabular-nums">
                  {dates[index].getUTCDate()}
                </time>
              </h2>
            ))}
            <div
              className="bg-background text-muted-foreground sticky left-0 z-10 grid border-r"
              style={{ gridTemplateRows: `repeat(${hours.length}, minmax(0, 1fr))` }}
              aria-hidden="true"
            >
              {hours.map((hour) => (
                <div key={hour} className="flex items-center justify-center border-b text-center text-xs tabular-nums last:border-b-0">
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}
            </div>
            {Object.entries(COURSE_DAY_LABELS).map(([day, label]) => {
              const lessons = schedules
                .filter(({ schedule }) => schedule.dayOfWeek === day)
                .sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime) || a.schedule.endTime.localeCompare(b.schedule.endTime));
              const laneEnds: number[] = [];
              const positionedLessons = lessons.map((lesson) => {
                const start = toMinutes(lesson.schedule.startTime);
                const end = toMinutes(lesson.schedule.endTime);
                let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);

                if (lane === -1) {
                  lane = laneEnds.length;
                }

                laneEnds[lane] = end;

                return { ...lesson, start, end, lane };
              });
              const laneCount = Math.max(1, laneEnds.length);

              return (
                <section
                  key={day}
                  aria-label={label}
                  className={cn(
                    "relative min-w-0 @4xl/page-shell:border-r @4xl/page-shell:last:border-r-0",
                    selectedDay !== day && "hidden @4xl/page-shell:block",
                  )}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 grid"
                    style={{ gridTemplateRows: `repeat(${hours.length}, minmax(0, 1fr))` }}
                  >
                    {hours.map((hour) => (
                      <div key={hour} className="border-b last:border-b-0" />
                    ))}
                  </div>
                  {positionedLessons.map(({ enrollment, schedule, start, end, lane }) => (
                    <MyScheduleEvent
                      key={`${weekStart}-${enrollment.id}-${schedule.id}`}
                      enrollment={enrollment}
                      schedule={schedule}
                      dayLabel={label}
                      duration={end - start}
                      style={{
                        top: `${((start - firstHour * 60) / totalMinutes) * 100}%`,
                        height: `calc(${((end - start) / totalMinutes) * 100}% - 2px)`,
                        left: `calc(${(lane / laneCount) * 100}% + 3px)`,
                        width: `calc(${100 / laneCount}% - 6px)`,
                      }}
                    />
                  ))}
                  {lessons.length === 0 ? <span className="sr-only">Sin clases</span> : null}
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}
