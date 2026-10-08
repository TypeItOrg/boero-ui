export interface CourseEnrollmentAssignmentOptions {
  courseId: string;
  format: "INDIVIDUAL" | "GRUPAL";
  classes: {
    id: string;
    label: string;
    teacherIds: string[];
    teachers: {
      personId: string;
      fullName: string;
    }[];
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
  }[];
}
