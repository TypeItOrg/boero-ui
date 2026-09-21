import { CalendarDaysIcon, ClockIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { COURSE_DAY_LABELS } from "@features/course-enrollments/constants/course-enrollment.constants";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";

type CourseEnrollmentScheduleCardsProps = {
  schedules: CourseEnrollment["schedules"];
};

export function CourseEnrollmentScheduleCards({ schedules }: CourseEnrollmentScheduleCardsProps): React.ReactElement {
  const days = [...new Set(schedules.map((schedule) => schedule.dayOfWeek))];
  const dayOrder = Object.keys(COURSE_DAY_LABELS);
  days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {days.map((day) => (
        <li key={day} className="bg-background overflow-hidden rounded-xl border shadow-2xs">
          <div className="bg-muted/25 flex items-center gap-2.5 border-b px-4 py-3">
            <div className="bg-background text-primary flex size-8 shrink-0 items-center justify-center rounded-lg border">
              <CalendarDaysIcon className="size-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold">{COURSE_DAY_LABELS[day] ?? day}</h3>
          </div>
          <ul className="divide-y px-4">
            {schedules
              .filter((schedule) => schedule.dayOfWeek === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((schedule) => (
                <li key={schedule.id} className="flex flex-wrap items-center justify-between gap-2 py-4">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                    <span className="text-base font-semibold tabular-nums">
                      {schedule.startTime.slice(0, 5)} <span className="text-muted-foreground font-normal">a</span> {schedule.endTime.slice(0, 5)}
                    </span>
                  </div>
                  {schedule.releasedAt ? <Badge variant="secondary">Liberado</Badge> : null}
                </li>
              ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
