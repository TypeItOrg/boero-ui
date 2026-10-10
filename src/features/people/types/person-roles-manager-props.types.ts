import type { AssignableRole } from "@features/people/types/assignable-role.types";
import type { PersonRole } from "@features/people/types/person-role.types";
import type { RoleAssignment } from "@features/people/types/role-assignment.types";
import { type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

export type PersonRolesManagerProps = {
  institutionId?: string;
  assignments?: readonly RoleAssignment[];
  onAssignmentChange?: (assignment: RoleAssignment) => void;
  disabled?: boolean;
  roles: AssignableRole[];
  assignedRoles: PersonRole[];
  selectedRoleCodes: readonly string[];
  onSelectedRoleCodesChange: (roleCodes: string[]) => void;
  canAssignRoles: boolean;
  canRevokeRoles: boolean;
  scope?: PeopleScopeType;
};
