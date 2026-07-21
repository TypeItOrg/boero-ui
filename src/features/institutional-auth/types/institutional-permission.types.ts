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
} as const;

export type InstitutionalPermission = (typeof INSTITUTIONAL_PERMISSION)[keyof typeof INSTITUTIONAL_PERMISSION];

const institutionalPermissionSet = new Set<string>(Object.values(INSTITUTIONAL_PERMISSION));

export function isInstitutionalPermission(value: string): value is InstitutionalPermission {
  return institutionalPermissionSet.has(value);
}
