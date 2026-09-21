export interface WeeklyScheduleItem {
  id: string;
  title: string;
  instrumentName?: string | null;
  context: string;
  schedules: {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
}
