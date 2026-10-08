export interface CourseEnrollmentSchedule {
  id: string;
  classScheduleId: string;
  individualSlotId?: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  releasedAt?: string | null;
}
