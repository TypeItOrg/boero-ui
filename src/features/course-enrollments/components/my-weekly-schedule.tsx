"use client";

import { useState, type ReactElement } from "react";

import { CalendarRangeIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { cn } from "@common/utils/cn.util";

import { MySubjectsSkeleton } from "@features/course-enrollments/components/my-subjects-skeleton";
import { WeeklyScheduleCalendar } from "@features/course-enrollments/components/weekly-schedule-calendar";
import { COURSE_DAY_LABELS } from "@features/course-enrollments/constants/course-enrollment.constants";
import type { WeeklyScheduleItem } from "@features/course-enrollments/types/weekly-schedule-item.types";
import { getScheduleWeek, isScheduleDate, shiftScheduleWeek } from "@features/course-enrollments/utils/schedule-week.util";
import { toMinutes } from "@features/course-enrollments/utils/weekly-schedule-time.util";

export function MyWeeklySchedule({
  items,
  referenceDate,
  weekStart,
}: {
  items: WeeklyScheduleItem[];
  referenceDate: string;
  weekStart: string;
}): ReactElement {
  const schedules = items.flatMap((item) => item.schedules.map((schedule) => ({ item, schedule })));

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
  const monthFormatter = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
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
              Podés recorrer las semanas para consultar los horarios de tus clases o volver a la semana actual con el botón «Hoy».
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <WeeklyScheduleCalendar
          calendarHeight={calendarHeight}
          selectedDay={selectedDay}
          dates={dates}
          hours={hours}
          schedules={schedules}
          weekStart={weekStart}
          firstHour={firstHour}
          totalMinutes={totalMinutes}
        />
      )}
    </div>
  );
}
