export const ACADEMIC_LIFECYCLE_ACTION_KIND = {
  DELETE: "delete",
  RESTORE: "restore",
} as const;

export type AcademicLifecycleActionKind = (typeof ACADEMIC_LIFECYCLE_ACTION_KIND)[keyof typeof ACADEMIC_LIFECYCLE_ACTION_KIND];
