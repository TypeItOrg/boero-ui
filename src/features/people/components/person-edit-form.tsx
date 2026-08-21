"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@common/components/ui/button";
import { cn } from "@common/utils/cn.util";
import { PersonForm } from "@features/people/components/person-form";
import { PersonRolesManager } from "@features/people/components/person-roles-manager";
import type { AssignableRole } from "@features/people/types/assignable-role.types";
import type { PersonRole } from "@features/people/types/person-role.types";
import type { Person } from "@features/people/types/person.types";
import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

type PersonEditFormProps = {
  formId: string;
  institutionId: string;
  person: Person;
  roles: AssignableRole[];
  assignedRoles: PersonRole[];
  scope?: PeopleScopeType;
  canEdit?: boolean;
  canAssignRoles?: boolean;
  canRevokeRoles?: boolean;
  returnTo?: string;
};

export function PersonEditForm({
  formId,
  institutionId,
  person,
  roles,
  assignedRoles,
  scope = PeopleScope.ADMIN,
  canEdit = true,
  canAssignRoles = true,
  canRevokeRoles = true,
  returnTo,
}: PersonEditFormProps): React.ReactElement {
  const canManageRoles = canAssignRoles || canRevokeRoles;
  const [selectedRoleCodes, setSelectedRoleCodes] = React.useState<string[]>(() => assignedRoles.map((role) => role.roleId));
  const destination = returnTo ?? (PeopleScope.isInstitutional(scope) ? "/people" : `/admin/institutions/${institutionId}/people`);

  return (
    <div className="flex h-full flex-1 flex-col gap-4">
      <div className={cn("grid items-start gap-4", canManageRoles && "xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px]")}>
        <PersonForm
          mode="edit"
          institutionId={institutionId}
          person={person}
          formId={formId}
          hideActions
          canEdit={canEdit}
          roleIds={canManageRoles ? selectedRoleCodes : undefined}
          scope={scope}
          returnTo={returnTo}
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

      <div className="mt-auto flex flex-row flex-wrap items-center justify-end gap-3">
        <Button asChild variant="outline" size="lg" className="flex-1 sm:flex-none">
          <Link href={destination}>Cancelar</Link>
        </Button>
        <Button type="submit" form={formId} size="lg" className="flex-1 sm:flex-none">
          {canEdit ? "Guardar cambios" : "Guardar roles"}
        </Button>
      </div>
    </div>
  );
}
