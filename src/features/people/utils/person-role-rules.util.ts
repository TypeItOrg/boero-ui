import type { SystemRoleCode } from "../types/person-role.types";

export const NON_APPLICANT_ROLE_CODES = [
  "INSTITUTIONAL_AUTHORITY",
  "ADMINISTRATIVE",
  "TEACHER",
  "GUARDIAN",
  "STUDENT",
] as const satisfies readonly SystemRoleCode[];

export function hasApplicantRoleConflict(
  roleCodes: readonly SystemRoleCode[],
  candidateRoleCode?: SystemRoleCode,
): boolean {
  const effectiveRoleCodes = candidateRoleCode ? [...roleCodes, candidateRoleCode] : roleCodes;

  if (!effectiveRoleCodes.includes("APPLICANT")) return false;

  return NON_APPLICANT_ROLE_CODES.some((roleCode) => effectiveRoleCodes.includes(roleCode));
}

export function getRoleCodesAfterAssignment(
  currentRoleCodes: readonly SystemRoleCode[],
  roleCode: SystemRoleCode,
): SystemRoleCode[] {
  const replacesCurrentRoles = roleCode === "APPLICANT" || currentRoleCodes.includes("APPLICANT");
  return replacesCurrentRoles ? [roleCode] : [...currentRoleCodes, roleCode];
}
