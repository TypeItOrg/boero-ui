const DEFAULT_FUTURE_YEARS = 20;

function getDefaultEndMonth(): Date {
  const today = new Date();

  return new Date(today.getFullYear() + DEFAULT_FUTURE_YEARS, 11);
}

export function getCalendarEndMonth(calendarMinDate: Date, calendarMaxDate: Date | undefined): Date {
  if (calendarMaxDate) {
    return calendarMaxDate;
  }

  const defaultEndMonth = getDefaultEndMonth();

  if (calendarMinDate <= defaultEndMonth) {
    return defaultEndMonth;
  }

  return new Date(calendarMinDate.getFullYear() + DEFAULT_FUTURE_YEARS, 11);
}

export function getCalendarDefaultMonth(value: Date | undefined, minDate: Date, maxDate: Date | undefined): Date {
  const candidate = value ?? new Date();

  if (candidate < minDate) {
    return minDate;
  }

  if (maxDate && candidate > maxDate) {
    return maxDate;
  }

  return candidate;
}

export function getDisabledDates(minDate: Date, maxDate: Date | undefined): { before: Date; after?: Date } {
  return maxDate ? { before: minDate, after: maxDate } : { before: minDate };
}
