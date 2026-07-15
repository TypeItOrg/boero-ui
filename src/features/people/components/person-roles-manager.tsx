"use client";

import * as React from "react";
import { PlusIcon, XIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import type { PersonRole, SystemRole, SystemRoleCode } from "../types/person-role.types";
import { formatRoleAssignedAt } from "../utils/person-role-date.util";
import { hasApplicantRoleConflict } from "../utils/person-role-rules.util";

type PersonRolesManagerProps = {
  roles: SystemRole[];
  assignedRoles: PersonRole[];
  selectedRoleCodes: readonly SystemRoleCode[];
  onSelectedRoleCodesChange: (roleCodes: SystemRoleCode[]) => void;
};

type SelectedRole = {
  roleCode: SystemRoleCode;
  displayName: string;
  assignedAt?: string;
};

export function PersonRolesManager({
  roles,
  assignedRoles,
  selectedRoleCodes,
  onSelectedRoleCodesChange,
}: PersonRolesManagerProps): React.ReactElement {
  const initialRoleCodes = React.useMemo(
    () => new Set<SystemRoleCode>(assignedRoles.map((role) => role.roleCode)),
    [assignedRoles],
  );
  const selectedRoleCodeSet = React.useMemo(() => new Set(selectedRoleCodes), [selectedRoleCodes]);
  const assignedRolesByCode = React.useMemo(
    () => new Map(assignedRoles.map((role) => [role.roleCode, role])),
    [assignedRoles],
  );
  const rolesByCode = React.useMemo(() => new Map(roles.map((role) => [role.code, role])), [roles]);
  const selectedRoles = React.useMemo(
    () => getSelectedRoles(selectedRoleCodeSet, rolesByCode, assignedRolesByCode),
    [assignedRolesByCode, rolesByCode, selectedRoleCodeSet],
  );
  const availableRoles = roles.filter((role) => !selectedRoleCodeSet.has(role.code));

  function selectRole(roleCode: SystemRoleCode): void {
    if (selectedRoleCodeSet.has(roleCode) || hasApplicantRoleConflict(selectedRoleCodes, roleCode)) return;

    onSelectedRoleCodesChange([...selectedRoleCodes, roleCode]);
  }

  function removeRole(roleCode: SystemRoleCode): void {
    if (selectedRoleCodes.length <= 1) return;

    onSelectedRoleCodesChange(selectedRoleCodes.filter((currentRoleCode) => currentRoleCode !== roleCode));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles institucionales</CardTitle>
        <CardDescription>Los cambios de roles se aplican al guardar el usuario.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Roles asignados</h3>
          {selectedRoles.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selectedRoles.map((role) => {
                const isPendingAssignment = !initialRoleCodes.has(role.roleCode);

                return (
                  <div key={role.roleCode} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-medium">{role.displayName}</span>
                      <span className="text-muted-foreground text-xs">
                        {isPendingAssignment
                          ? "Se asignará al guardar."
                          : `Asignado: ${formatAssignedAt(role.assignedAt)}`}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant={isPendingAssignment ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => removeRole(role.roleCode)}
                      disabled={selectedRoleCodes.length <= 1}
                    >
                      <XIcon data-icon="inline-start" />
                      {isPendingAssignment ? "Quitar" : "Revocar"}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground rounded-lg border p-4 text-sm">
              Este usuario no tendrá roles asignados.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Roles disponibles</h3>
          {availableRoles.length > 0 ? (
            <div className="flex flex-col gap-2">
              {availableRoles.map((role) => {
                const isPendingRevocation = initialRoleCodes.has(role.code);
                const hasRoleConflict = hasApplicantRoleConflict(selectedRoleCodes, role.code);

                return (
                  <div key={role.code} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="font-medium">{role.displayName}</p>
                      {isPendingRevocation ? (
                        <p className="text-muted-foreground mt-1 text-xs">Se revocará al guardar.</p>
                      ) : hasRoleConflict ? (
                        <p className="text-muted-foreground mt-1 text-xs">Postulante debe ser el único rol.</p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => selectRole(role.code)}
                      disabled={hasRoleConflict}
                    >
                      <PlusIcon data-icon="inline-start" />
                      Asignar
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground rounded-lg border p-4 text-sm">Todos los roles están seleccionados.</p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

function getSelectedRoles(
  selectedRoleCodes: ReadonlySet<SystemRoleCode>,
  rolesByCode: ReadonlyMap<SystemRoleCode, SystemRole>,
  assignedRolesByCode: ReadonlyMap<SystemRoleCode, PersonRole>,
): SelectedRole[] {
  return Array.from(selectedRoleCodes).flatMap((roleCode) => {
    const assignedRole = assignedRolesByCode.get(roleCode);
    if (assignedRole) {
      return [
        {
          roleCode,
          displayName: assignedRole.displayName,
          assignedAt: assignedRole.assignedAt,
        },
      ];
    }

    const role = rolesByCode.get(roleCode);
    return role ? [{ roleCode, displayName: role.displayName }] : [];
  });
}


function formatAssignedAt(value: string | undefined): string {
  if (!value) return "Asignación pendiente";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return formatRoleAssignedAt(value);
}
