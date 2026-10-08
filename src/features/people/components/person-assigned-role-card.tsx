"use client";

import type { ReactElement } from "react";

import { XIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";

import { RoleAssignmentScopeFields } from "@features/people/components/role-assignment-scope-fields";
import type { AssignableRole } from "@features/people/types/assignable-role.types";
import type { PersonRole } from "@features/people/types/person-role.types";
import type { SelectedRole } from "@features/people/types/person-selected-role.types";
import type { RoleAssignment } from "@features/people/types/role-assignment.types";
import { PeopleScope } from "@features/people/utils/people-scope.util";
import { formatAssignedAt } from "@features/people/utils/person-role-assigned-at.util";

export function PersonAssignedRoleCard({
  role,
  isPendingAssignment,
  removeRole,
  disabled,
  selectedRoleCodes,
  canApplyRoleCodes,
  nextRoleCodes,
  isRevokable,
  institutionId,
  onAssignmentChange,
  assignments,
  rolesByCode,
  scope,
  assignedRolesByCode,
  canAssignRoles,
  canRevokeRoles,
  isInstitutionalAuthority,
}: {
  role: SelectedRole;
  isPendingAssignment: boolean;
  removeRole: (roleCode: string) => void;
  disabled: boolean;
  selectedRoleCodes: readonly string[];
  canApplyRoleCodes: (nextRoleCodes: readonly string[]) => boolean;
  nextRoleCodes: string[];
  isRevokable: boolean;
  institutionId: string | undefined;
  onAssignmentChange: ((assignment: RoleAssignment) => void) | undefined;
  assignments: readonly RoleAssignment[] | undefined;
  rolesByCode: Map<string, AssignableRole>;
  scope: PeopleScope;
  assignedRolesByCode: Map<string, PersonRole>;
  canAssignRoles: boolean;
  canRevokeRoles: boolean;
  isInstitutionalAuthority: boolean;
}): ReactElement {
  return (
    <div key={role.roleId} className="grid gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-medium">{role.displayName}</span>
          <span className="text-muted-foreground text-xs">
            {isPendingAssignment ? "Se asignará al guardar." : `Asignado: ${formatAssignedAt(role.assignedAt)}`}
          </span>
        </div>
        <Button
          type="button"
          variant={isPendingAssignment ? "outline" : "destructive"}
          size="sm"
          onClick={() => removeRole(role.roleId)}
          disabled={disabled || selectedRoleCodes.length <= 1 || !canApplyRoleCodes(nextRoleCodes) || !isRevokable}
        >
          <XIcon data-icon="inline-start" />
          {isPendingAssignment ? "Quitar" : "Revocar"}
        </Button>
      </div>
      {institutionId && onAssignmentChange && assignments ? (
        <RoleAssignmentScopeFields
          supportsTrainingPathScope={rolesByCode.get(role.roleId)?.supportsTrainingPathScope === true}
          inactivePermissions={rolesByCode.get(role.roleId)?.inactivePermissionDescriptionsWhenScoped ?? []}
          institutionId={institutionId}
          scope={scope}
          value={assignments.find((a) => a.roleId === role.roleId)!}
          names={assignedRolesByCode.get(role.roleId)?.trainingPathNames ?? {}}
          onChange={(next) => {
            const original = assignedRolesByCode.get(role.roleId);
            const previous: Pick<RoleAssignment, "accessScope" | "trainingPathIds"> = original ?? {
              accessScope: "TRAINING_PATHS",
              trainingPathIds: [],
            };
            const expands =
              previous.accessScope !== "INSTITUTION" &&
              (next.accessScope === "INSTITUTION" || next.trainingPathIds.some((id) => !previous.trainingPathIds.includes(id)));
            const reduces =
              next.accessScope !== "INSTITUTION" &&
              (previous.accessScope === "INSTITUTION" || previous.trainingPathIds.some((id) => !next.trainingPathIds.includes(id)));

            if ((!expands || canAssignRoles) && (!reduces || canRevokeRoles)) {
              onAssignmentChange(next);
            }
          }}
          disabled={disabled || isInstitutionalAuthority || (!canAssignRoles && !canRevokeRoles)}
        />
      ) : null}
    </div>
  );
}
