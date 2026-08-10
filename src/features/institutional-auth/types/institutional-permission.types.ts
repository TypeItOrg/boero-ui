export const INSTITUTIONAL_PERMISSION = {
  PERSON_READ_ANY: "institution:person:read-any",
  PERSON_CREATE: "institution:person:create",
  PERSON_UPDATE_ANY: "institution:person:update-any",
  PERSON_DELETE: "institution:person:delete",
  USER_STATUS_UPDATE: "institution:users:update-status",
  ROLE_ASSIGN: "institution:roles:assign",
  ROLE_REVOKE: "institution:roles:revoke",
  ROLE_READ: "institution:roles:read",
  ROLE_CREATE: "institution:roles:create",
  ROLE_UPDATE: "institution:roles:update",
  ROLE_DELETE: "institution:roles:delete",
  GRADES_ENTER: "institution:grades:enter",
  GRADES_ENTER_FINAL: "institution:grades:enter-final",
  INSTITUTION_READ: "institution:read",
  INSTITUTION_UPDATE: "institution:update",
  ACADEMIC_YEAR_READ: "institution:academic-year:read",
  ACADEMIC_YEAR_CREATE: "institution:academic-year:create",
  ACADEMIC_YEAR_UPDATE: "institution:academic-year:update",
  ACADEMIC_YEAR_STATUS_UPDATE: "institution:academic-year:update-status",
  TRAINING_PATH_READ: "institution:training-path:read",
  TRAINING_PATH_CREATE: "institution:training-path:create",
  TRAINING_PATH_UPDATE: "institution:training-path:update",
  TRAINING_PATH_STATUS_UPDATE: "institution:training-path:update-status",
  STUDY_PLAN_READ: "institution:study-plan:read",
  STUDY_PLAN_CREATE: "institution:study-plan:create",
  STUDY_PLAN_UPDATE: "institution:study-plan:update",
  STUDY_PLAN_STATUS_UPDATE: "institution:study-plan:update-status",
  STUDY_PLAN_CURRICULUM_UPDATE: "institution:study-plan:curriculum-update",
  ACADEMIC_SPACE_READ: "institution:academic-space:read",
  ACADEMIC_SPACE_CREATE: "institution:academic-space:create",
  ACADEMIC_SPACE_UPDATE: "institution:academic-space:update",
  ACADEMIC_SPACE_STATUS_UPDATE: "institution:academic-space:update-status",
  INSTRUMENT_READ: "institution:instrument:read",
  INSTRUMENT_CREATE: "institution:instrument:create",
  INSTRUMENT_UPDATE: "institution:instrument:update",
  INSTRUMENT_STATUS_UPDATE: "institution:instrument:update-status",
} as const;

export type InstitutionalPermission = (typeof INSTITUTIONAL_PERMISSION)[keyof typeof INSTITUTIONAL_PERMISSION];

const institutionalPermissionSet = new Set<string>(Object.values(INSTITUTIONAL_PERMISSION));

export function isInstitutionalPermission(value: string): value is InstitutionalPermission {
  return institutionalPermissionSet.has(value);
}
