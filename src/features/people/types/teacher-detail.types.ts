import type { TeacherCourseAssignment } from "@features/people/types/teacher-course-assignment.types";

export type TeacherDetail = {
  person: {
    personId: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
    phoneNumber: string | null;
    email: string;
    institutionName: string;
  };
  enabled: boolean;
  function: string;
  courses: TeacherCourseAssignment[];
};
