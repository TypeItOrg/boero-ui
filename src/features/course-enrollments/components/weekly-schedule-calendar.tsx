"use client";

import type { ReactElement } from "react";

import { cn } from "@common/utils/cn.util";

import { MyScheduleEvent } from "@features/course-enrollments/components/my-schedule-event";
import { COURSE_DAY_LABELS } from "@features/course-enrollments/constants/course-enrollment.constants";
import type { WeeklyScheduleItem } from "@features/course-enrollments/types/weekly-schedule-item.types";
import { toMinutes } from "@features/course-enrollments/utils/weekly-schedule-time.util";

export function WeeklyScheduleCalendar({
  calendarHeight,
  selectedDay,
  dates,
  hours,
  schedules,
  weekStart,
  firstHour,
  totalMinutes,
}: {
  calendarHeight: number;
  selectedDay: string;
  dates: Date[];
  hours: number[];
  schedules: {
    item: WeeklyScheduleItem;
    schedule: { id: string; dayOfWeek: string; startTime: string; endTime: string };
  }[];
  weekStart: string;
  firstHour: number;
  totalMinutes: number;
}): ReactElement {
  return (
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
              {positionedLessons.map(({ item, schedule, start, end, lane }) => (
                <MyScheduleEvent
                  key={`${weekStart}-${item.id}-${schedule.id}`}
                  item={item}
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
  );
}
