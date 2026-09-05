"use client";

import * as React from "react";
import { Clock8Icon } from "lucide-react";

import { Time } from "@internationalized/date";
import { DateInput, DateSegment, TimeField } from "react-aria-components";

type TimeInputWithIconProps = {
  id: string;
  "aria-label": string;
  "aria-invalid"?: boolean;
  value: string;
  onValueChange: (value: string) => void;
};

export function TimeInputWithIcon({
  id,
  "aria-label": label,
  "aria-invalid": invalid,
  value,
  onValueChange,
}: TimeInputWithIconProps): React.ReactElement {
  const validTime = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  const time = validTime ? new Time(Number(validTime[1]), Number(validTime[2])) : null;
  return (
    <TimeField
      id={id}
      aria-label={label}
      isInvalid={invalid}
      hourCycle={24}
      granularity="minute"
      shouldForceLeadingZeros
      value={time}
      onChange={(nextTime) => onValueChange(nextTime ? `${String(nextTime.hour).padStart(2, "0")}:${String(nextTime.minute).padStart(2, "0")}` : "")}
    >
      <div className="border-input bg-background focus-within:border-ring focus-within:ring-ring/50 has-[[data-invalid]]:border-destructive flex h-9 items-center gap-2 rounded-md border px-3 shadow-xs transition-[color,box-shadow] focus-within:ring-3">
        <Clock8Icon aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
        <DateInput className="min-w-0 flex-1 font-[inherit] text-base leading-normal font-normal tracking-normal whitespace-nowrap normal-nums md:text-sm">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="data-[placeholder]:text-muted-foreground focus:bg-primary focus:text-primary-foreground inline rounded-sm font-[inherit] tracking-normal outline-none"
            >
              {segment.text}
            </DateSegment>
          )}
        </DateInput>
      </div>
    </TimeField>
  );
}
