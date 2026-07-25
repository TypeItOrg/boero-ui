export const SYSTEM_ROLE_CODES = [
  "INSTITUTIONAL_AUTHORITY",
  "ADMINISTRATIVE",
  "TEACHER",
  "GUARDIAN",
  "APPLICANT",
  "STUDENT",
] as const;

export type SystemRoleCode = (typeof SYSTEM_ROLE_CODES)[number];

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
