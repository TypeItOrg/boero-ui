"use client";

import * as React from "react";

import { PersonForm } from "./person-form";
import { PersonRolesManager } from "./person-roles-manager";
import type { PersonRole, SystemRole, SystemRoleCode } from "../types/person-role.types";
import type { Person } from "../types/person.types";

type PersonEditFormProps = {
  formId: string;
  institutionId: string;
  person: Person;
  roles: SystemRole[];
  assignedRoles: PersonRole[];
};

export function PersonEditForm({
  formId,
  institutionId,
  person,
  roles,
  assignedRoles,
}: PersonEditFormProps): React.ReactElement {
  const [selectedRoleCodes, setSelectedRoleCodes] = React.useState<SystemRoleCode[]>(() =>
    assignedRoles.map((role) => role.roleCode),
  );

  function handleRoleCodesChange(roleCodes: SystemRoleCode[]): void {
    setSelectedRoleCodes(roleCodes);
  }

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
      <PersonForm
        mode="edit"
        institutionId={institutionId}
        person={person}
        formId={formId}
        hideActions
        roleCodes={selectedRoleCodes}
      />
      <PersonRolesManager
        roles={roles}
        assignedRoles={assignedRoles}
        selectedRoleCodes={selectedRoleCodes}
        onSelectedRoleCodesChange={handleRoleCodesChange}
      />
    </div>
  );
}
