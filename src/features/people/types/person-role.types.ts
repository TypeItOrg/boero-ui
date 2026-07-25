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

export type SystemRole = {
  code: SystemRoleCode;
  displayName: string;
};

export type SystemRoleList = {
  roles: SystemRole[];
};

export type AssignableRole = {
  id: string;
  name: string;
  technicalCode: SystemRoleCode | null;
};

export type PersonRole = {
  roleId: string;
  technicalCode: SystemRoleCode | null;
  displayName: string;
  assignedAt: string;
};
