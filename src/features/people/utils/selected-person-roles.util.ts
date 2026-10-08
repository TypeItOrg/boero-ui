import type { AssignableRole } from "@features/people/types/assignable-role.types";
import type { PersonRole } from "@features/people/types/person-role.types";
import { type SelectedRole } from "@features/people/types/person-selected-role.types";

export function getSelectedRoles(
  selectedRoleCodes: ReadonlySet<string>,
  rolesByCode: ReadonlyMap<string, AssignableRole>,
  assignedRolesByCode: ReadonlyMap<string, PersonRole>,
): SelectedRole[] {
  return Array.from(selectedRoleCodes).flatMap((roleId) => {
    const assignedRole = assignedRolesByCode.get(roleId);

    if (assignedRole) {
      return [
        {
          roleId,
          technicalCode: assignedRole.technicalCode,
          displayName: assignedRole.displayName,
          assignedAt: assignedRole.assignedAt,
        },
      ];
    }

    const role = rolesByCode.get(roleId);

    return role ? [{ roleId, technicalCode: role.technicalCode, displayName: role.name }] : [];
  });
}
