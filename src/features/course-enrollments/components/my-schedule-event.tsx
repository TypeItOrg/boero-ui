"use client";

import type { CSSProperties } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@common/components/ui/popover";
import { cn } from "@common/utils/cn.util";
import type { WeeklyScheduleItem } from "@features/course-enrollments/types/weekly-schedule-item.types";

type MyScheduleEventProps = {
  item: WeeklyScheduleItem;
  schedule: WeeklyScheduleItem["schedules"][number];
  dayLabel: string;
  duration: number;
  style: CSSProperties;
};

export function MyScheduleEvent({ item, schedule, dayLabel, duration, style }: MyScheduleEventProps): React.ReactElement {
  const time = `${schedule.startTime.slice(0, 5)}–${schedule.endTime.slice(0, 5)}`;
  const compact = duration < 30;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${item.title}, ${dayLabel}, ${time}${item.instrumentName ? `, ${item.instrumentName}` : ""}`}
          className={cn(
            "border-primary/25 text-primary focus-visible:ring-ring absolute min-w-0 overflow-hidden rounded-lg border border-l-3 px-2 text-left transition-shadow hover:shadow-sm focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none",
            compact ? "flex items-center gap-2 py-0" : "flex flex-col items-stretch py-1",
          )}
          style={{ ...style, backgroundColor: "color-mix(in srgb, var(--primary) 10%, var(--background))" }}
        >
          <span className="block shrink-0 truncate text-xs leading-4 font-medium tabular-nums">{time}</span>
          <span
            className={cn(
              "text-[13px] leading-4 font-semibold",
              compact ? "min-w-0 flex-1 truncate" : duration >= 40 ? "mt-0.5 line-clamp-2 shrink-0" : "mt-0.5 shrink-0 truncate",
            )}
          >
            {item.title}
          </span>
          {!compact && duration >= 40 && item.instrumentName ? (
            <span className="mt-0.5 block shrink-0 truncate text-xs leading-4">{item.instrumentName}</span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent collisionPadding={16} className="w-80 max-w-[calc(100vw-2rem)] p-4" aria-label={item.title}>
        <h3 className="text-base leading-snug font-semibold wrap-break-word">{item.title}</h3>
        <p className="text-primary text-sm font-medium">
          {dayLabel} · {time}
        </p>
        {item.instrumentName ? <p className="text-muted-foreground text-sm">Instrumento: {item.instrumentName}</p> : null}
        <p className="text-muted-foreground text-sm wrap-break-word">{item.context}</p>
      </PopoverContent>
    </Popover>
  );
}
