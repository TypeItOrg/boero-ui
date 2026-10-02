"use client";

import { useState } from "react";
import { COURSE_DAY_LABELS } from "@features/course-enrollments/constants/course-enrollment.constants";
import type { CourseWeekDay } from "@features/academic/types/course-week-day.types";
import type { TeacherCourseAssignment } from "@features/people/types/teacher-course-assignment.types";

type Event = { id: string; course: string; classLabel: string; day: CourseWeekDay; start: string; end: string };

export function TeacherWeeklySchedule({ courses }: { courses: TeacherCourseAssignment[] }): React.ReactElement {
  const events = courses.flatMap((course) =>
    course.classes.flatMap((item) =>
      item.days.flatMap((day) =>
        day.schedules.map((schedule) => ({
          id: `${item.id}-${day.dayOfWeek}-${schedule.startTime}`,
          course: course.academicSpaceName,
          classLabel: `Clase ${item.classNumber}`,
          day: day.dayOfWeek,
          start: schedule.startTime,
          end: schedule.endTime,
        })),
      ),
    ),
  ) as Event[];
  const days = Object.keys(COURSE_DAY_LABELS) as CourseWeekDay[];
  const [selectedDay, setSelectedDay] = useState<CourseWeekDay>(events[0]?.day ?? "MONDAY");
  if (events.length === 0)
    return <p className="text-muted-foreground rounded-xl border p-6 text-center text-sm">No hay horarios asignados para mostrar.</p>;
  const firstHour = Math.max(0, Math.floor(Math.min(...events.map((event) => minutes(event.start))) / 60) - 1);
  const lastHour = Math.min(24, Math.max(firstHour + 4, Math.ceil(Math.max(...events.map((event) => minutes(event.end))) / 60) + 1));
  const hours = Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index);
  const total = (lastHour - firstHour) * 60;
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-muted grid grid-cols-7 gap-1 rounded-lg p-1 md:hidden">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            aria-pressed={selectedDay === day}
            onClick={() => setSelectedDay(day)}
            className={`rounded-md px-2 py-2 text-xs font-medium ${selectedDay === day ? "bg-background text-primary shadow-xs" : "text-muted-foreground"}`}
          >
            {COURSE_DAY_LABELS[day].slice(0, 3)}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <div className="grid min-w-210 grid-cols-[4rem_repeat(7,minmax(0,1fr))]">
          <div className="bg-muted/25 border-r border-b" />
          {days.map((day) => (
            <div key={day} className={`bg-muted/25 border-b p-3 text-center text-xs font-semibold ${selectedDay !== day ? "hidden md:block" : ""}`}>
              {COURSE_DAY_LABELS[day]}
            </div>
          ))}
          <div className="bg-muted/25 border-r" style={{ display: "grid", gridTemplateRows: `repeat(${hours.length}, 1fr)` }}>
            {hours.map((hour) => (
              <div key={hour} className="text-muted-foreground border-b px-2 py-3 text-center text-xs tabular-nums">
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div
              key={day}
              className={`relative border-r last:border-r-0 ${selectedDay !== day ? "hidden md:block" : ""}`}
              style={{ minHeight: `${hours.length * 72}px` }}
            >
              <div className="pointer-events-none absolute inset-0 grid" style={{ gridTemplateRows: `repeat(${hours.length}, 1fr)` }}>
                {hours.map((hour) => (
                  <div key={hour} className="border-b" />
                ))}
              </div>
              {events
                .filter((event) => event.day === day)
                .map((event) => (
                  <div
                    key={event.id}
                    className="bg-primary/15 border-primary/30 absolute right-1 left-1 z-10 overflow-hidden rounded-md border p-2 text-xs"
                    style={{
                      top: `${((minutes(event.start) - firstHour * 60) / total) * 100}%`,
                      height: `${((minutes(event.end) - minutes(event.start)) / total) * 100}%`,
                    }}
                  >
                    <p className="text-primary truncate font-semibold">{event.course}</p>
                    <p className="text-muted-foreground truncate">{event.classLabel}</p>
                    <p className="text-muted-foreground tabular-nums">
                      {event.start.slice(0, 5)} - {event.end.slice(0, 5)}
                    </p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-muted-foreground text-xs">Los espacios sin eventos representan franjas sin clases registradas.</p>
    </div>
  );
}

function minutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}
