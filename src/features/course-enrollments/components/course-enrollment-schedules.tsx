import { ClockIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { COURSE_DAY_LABELS } from "@features/course-enrollments/constants/course-enrollment.constants";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";

type CourseEnrollmentSchedulesProps = {
  schedules: CourseEnrollment["schedules"];
};

export function CourseEnrollmentSchedules({ schedules }: CourseEnrollmentSchedulesProps): React.ReactElement {
  const groups = new Map<string, { days: Set<string>; startTime: string; endTime: string; released: boolean }>();

  for (const schedule of schedules) {
    const startTime = schedule.startTime.slice(0, 5);
    const endTime = schedule.endTime.slice(0, 5);
    const released = Boolean(schedule.releasedAt);
    const key = `${startTime}-${endTime}-${released}`;
    const group = groups.get(key);

    if (group) {
      group.days.add(schedule.dayOfWeek);
    } else {
      groups.set(key, { days: new Set([schedule.dayOfWeek]), startTime, endTime, released });
    }
  }

  if (groups.size === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const dayOrder = Object.keys(COURSE_DAY_LABELS);

  return (
    <div className="max-w-64 min-w-40 space-y-2 py-1">
      {Array.from(groups, ([key, group]) => (
        <div key={key} className="space-y-0.5">
          <div className="text-sm font-medium whitespace-normal">
            {Array.from(group.days)
              .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
              .map((day) => COURSE_DAY_LABELS[day] ?? day)
              .join(" · ")}
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
            <ClockIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap tabular-nums">
              {group.startTime}–{group.endTime}
            </span>
            {group.released ? <Badge variant="secondary">Liberado</Badge> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
