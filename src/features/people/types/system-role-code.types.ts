export const SystemRoleCode = {
  INSTITUTIONAL_AUTHORITY: "INSTITUTIONAL_AUTHORITY",
  ADMINISTRATIVE: "ADMINISTRATIVE",
  TEACHER: "TEACHER",
  GUARDIAN: "GUARDIAN",
  APPLICANT: "APPLICANT",
  STUDENT: "STUDENT",
} as const;

export type SystemRoleCode = (typeof SystemRoleCode)[keyof typeof SystemRoleCode];

export const SYSTEM_ROLE_CODES = Object.values(SystemRoleCode);
