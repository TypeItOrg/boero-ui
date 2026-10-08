import type { Shift } from "@features/academic/types/shift.types";

export function getEnrollmentShiftOptions(initialShifts: readonly Shift[], preferredShift: string): { value: string; label: string }[] {
  const options = initialShifts.map((shift) => ({ value: shift.name, label: shift.name }));

  if (preferredShift && !options.some((option) => option.value === preferredShift)) {
    return [{ value: preferredShift, label: preferredShift }, ...options];
  }

  return options;
}
