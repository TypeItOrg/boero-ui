"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { cn } from "@common/utils/cn.util";
import { PersonForm } from "@features/people/components/person-form";
import { PersonRolesManager } from "@features/people/components/person-roles-manager";
import type { AssignableRole } from "@features/people/types/assignable-role.types";
import type { RoleAssignment } from "@features/people/types/role-assignment.types";
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
  const [roleScopes, setRoleScopes] = React.useState<Record<string, RoleAssignment>>(() =>
    Object.fromEntries(
      assignedRoles.map((role) => [role.roleId, { roleId: role.roleId, accessScope: role.accessScope, trainingPathIds: role.trainingPathIds }]),
    ),
  );
  const assignments = selectedRoleCodes.map((roleId) => roleScopes[roleId] ?? { roleId, accessScope: "INSTITUTION" as const, trainingPathIds: [] });
  const [isPending, setIsPending] = React.useState(false);
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
          onPendingChange={setIsPending}
          canEdit={canEdit}
          assignments={canManageRoles ? assignments : undefined}
          scope={scope}
          returnTo={returnTo}
        />
        {canManageRoles ? (
          <PersonRolesManager
            institutionId={institutionId}
            assignments={assignments}
            onAssignmentChange={(assignment) => setRoleScopes((current) => ({ ...current, [assignment.roleId]: assignment }))}
            disabled={isPending}
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
        <Button asChild variant="outline" size="lg" className={cn("flex-1 sm:flex-none", isPending && "pointer-events-none opacity-50")}>
          <Link
            href={destination}
            aria-disabled={isPending}
            tabIndex={isPending ? -1 : undefined}
            onClick={(event) => {
              if (isPending) {
                event.preventDefault();
              }
            }}
          >
            Cancelar
          </Link>
        </Button>
        <Button type="submit" form={formId} size="lg" className="flex-1 sm:flex-none" disabled={isPending}>
          {isPending ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : null}
          {isPending ? "Guardando..." : canEdit ? "Guardar cambios" : "Guardar roles"}
        </Button>
      </div>
    </div>
  );
}
