export const ACADEMIC_ROW_ACTION_KIND = {
  NAVIGATE: "navigate",
  STATUS: "status",
  DELETE: "delete",
  RESTORE: "restore",
} as const;

export type AcademicRowActionKind = (typeof ACADEMIC_ROW_ACTION_KIND)[keyof typeof ACADEMIC_ROW_ACTION_KIND];
