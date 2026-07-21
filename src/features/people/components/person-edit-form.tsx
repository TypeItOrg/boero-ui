"use client";

import * as React from "react";

import { cn } from "@common/utils/cn.util";
import { PersonForm } from "@features/people/components/person-form";
import { PersonRolesManager } from "@features/people/components/person-roles-manager";
import type { AssignableRole, PersonRole } from "@features/people/types/person-role.types";
import type { Person } from "@features/people/types/person.types";
import type { PeopleScope } from "@features/people/utils/people-scope.util";

type PersonEditFormProps = {
  formId: string;
  institutionId: string;
  person: Person;
  roles: AssignableRole[];
  assignedRoles: PersonRole[];
  scope?: PeopleScope;
  canEdit?: boolean;
  canAssignRoles?: boolean;
  canRevokeRoles?: boolean;
};

export function PersonEditForm({
  formId,
  institutionId,
  person,
  roles,
  assignedRoles,
  scope = "admin",
  canEdit = true,
  canAssignRoles = true,
  canRevokeRoles = true,
}: PersonEditFormProps): React.ReactElement {
  const canManageRoles = canAssignRoles || canRevokeRoles;
  const [selectedRoleCodes, setSelectedRoleCodes] = React.useState<string[]>(() =>
    assignedRoles.map((role) => role.roleId),
  );

  return (
    <div
      className={cn(
        "grid items-start gap-8",
        canManageRoles && "xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px]",
      )}
    >
      <PersonForm
        mode="edit"
        institutionId={institutionId}
        person={person}
        formId={formId}
        hideActions
        canEdit={canEdit}
        roleIds={canManageRoles ? selectedRoleCodes : undefined}
        scope={scope}
      />
      {canManageRoles ? (
        <PersonRolesManager
          roles={roles}
          assignedRoles={assignedRoles}
          selectedRoleCodes={selectedRoleCodes}
          onSelectedRoleCodesChange={setSelectedRoleCodes}
          canAssignRoles={canAssignRoles}
          canRevokeRoles={canRevokeRoles}
          scope={scope}
        />
      ) : null}
    </div>
  );
}
