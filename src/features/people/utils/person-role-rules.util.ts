export type PersonRoleChanges = {
  assignments: string[];
  revocations: string[];
};

export function getRoleChanges(
  currentRoleCodes: readonly string[],
  desiredRoleCodes: readonly string[],
): PersonRoleChanges {
  const currentRoleCodeSet = new Set(currentRoleCodes);
  const desiredRoleCodeSet = new Set(desiredRoleCodes);
  const assignments = desiredRoleCodes.filter((roleCode) => !currentRoleCodeSet.has(roleCode));

  return {
    assignments,
    revocations: currentRoleCodes.filter((roleCode) => !desiredRoleCodeSet.has(roleCode)),
  };
}
