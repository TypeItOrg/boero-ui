import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";
import type { DaySelection } from "@features/course-enrollments/types/course-enrollment-day-selection.types";

export type CourseEnrollmentScheduleFieldsProps = {
  options: CourseEnrollmentAssignmentOptions;
  selectedClass:
    | {
        id: string;
        label: string;
        teacherIds: string[];
        teachers: { personId: string; fullName: string }[];
        days: {
          id: string;
          dayOfWeek: string;
          capacity: number | null;
          availableCapacity: number | null;
          periodDurationMinutes: number | null;
          schedules: {
            id: string;
            startTime: string;
            endTime: string;
            individualSlots: {
              id: string;
              startTime: string;
              endTime: string;
              available: boolean;
            }[];
          }[];
        }[];
      }
    | undefined;
  checkedDays: string[];
  daySelections: Record<string, DaySelection>;
  invalidDaySet: Set<string>;
  disabled: boolean;
  handleDayToggle: (dayId: string, checked: boolean) => void;
  handleScheduleChange: (dayId: string, scheduleId: string) => void;
  handleSlotChange: (dayId: string, individualSlotId: string) => void;
};
