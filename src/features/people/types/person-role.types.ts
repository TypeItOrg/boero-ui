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

export type PersonRole = {
  roleCode: SystemRoleCode;
  displayName: string;
  assignedAt: string;
};

export const FALLBACK_SYSTEM_ROLES: SystemRole[] = [
  { code: "INSTITUTIONAL_AUTHORITY", displayName: "Autoridad Institucional" },
  { code: "ADMINISTRATIVE", displayName: "Administrativo" },
  { code: "TEACHER", displayName: "Docente" },
  { code: "GUARDIAN", displayName: "Tutor" },
  { code: "APPLICANT", displayName: "Postulante" },
  { code: "STUDENT", displayName: "Estudiante" },
];
