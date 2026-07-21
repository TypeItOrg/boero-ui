"use client";

import * as React from "react";
import { PlusIcon, XIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import type { AssignableRole, PersonRole, SystemRoleCode } from "@features/people/types/person-role.types";
import { formatRoleAssignedAt } from "@features/people/utils/person-role-date.util";
import { getRoleChanges } from "@features/people/utils/person-role-rules.util";
import type { PeopleScope } from "@features/people/utils/people-scope.util";

type PersonRolesManagerProps = {
  roles: AssignableRole[];
  assignedRoles: PersonRole[];
  selectedRoleCodes: readonly string[];
  onSelectedRoleCodesChange: (roleCodes: string[]) => void;
  canAssignRoles: boolean;
  canRevokeRoles: boolean;
  scope?: PeopleScope;
};

type SelectedRole = {
  roleId: string;
  technicalCode: SystemRoleCode | null;
  displayName: string;
  assignedAt?: string;
};

export function PersonRolesManager({
  roles,
  assignedRoles,
  selectedRoleCodes,
  onSelectedRoleCodesChange,
  canAssignRoles,
  canRevokeRoles,
  scope = "admin",
}: PersonRolesManagerProps): React.ReactElement {
  const initialRoleCodes = React.useMemo(() => assignedRoles.map((role) => role.roleId), [assignedRoles]);
  const initialRoleCodeSet = React.useMemo(() => new Set(initialRoleCodes), [initialRoleCodes]);
  const selectedRoleCodeSet = React.useMemo(() => new Set(selectedRoleCodes), [selectedRoleCodes]);
  const assignedRolesByCode = React.useMemo(
    () => new Map(assignedRoles.map((role) => [role.roleId, role])),
    [assignedRoles],
  );
  const rolesByCode = React.useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);
  const selectedRoles = React.useMemo(
    () => getSelectedRoles(selectedRoleCodeSet, rolesByCode, assignedRolesByCode),
    [assignedRolesByCode, rolesByCode, selectedRoleCodeSet],
  );
  const availableRoles = roles.filter((role) => !selectedRoleCodeSet.has(role.id));
  const applicantRoleId = roles.find((role) => role.technicalCode === "APPLICANT")?.id;

  function selectRole(roleId: string): void {
    if (selectedRoleCodeSet.has(roleId)) return;

    const roleSelection = getRoleSelection(roleId);
    if (!canApplyRoleCodes(roleSelection.roleIds, roleSelection.implicitRevocationIds)) return;

    onSelectedRoleCodesChange(roleSelection.roleIds);
  }

  function removeRole(roleCode: string): void {
    if (selectedRoleCodes.length <= 1) return;

    const nextRoleCodes = selectedRoleCodes.filter((currentRoleCode) => currentRoleCode !== roleCode);
    if (!canApplyRoleCodes(nextRoleCodes)) return;

    onSelectedRoleCodesChange(nextRoleCodes);
  }

  function canApplyRoleCodes(nextRoleCodes: readonly string[], implicitRevocationIds: readonly string[] = []): boolean {
    const roleChanges = getRoleChanges(initialRoleCodes, nextRoleCodes);
    const implicitRevocationIdSet = new Set(implicitRevocationIds);
    const requiresExplicitRevocation = roleChanges.revocations.some((roleId) => !implicitRevocationIdSet.has(roleId));
    const canAssign = roleChanges.assignments.length === 0 || canAssignRoles;
    const canRevoke = !requiresExplicitRevocation || canRevokeRoles;

    return canAssign && canRevoke;
  }

  function getRoleSelection(roleId: string): {
    roleIds: string[];
    implicitRevocationIds: string[];
  } {
    const candidate = rolesByCode.get(roleId);
    const replacesSelectedRoles =
      candidate?.technicalCode === "APPLICANT" ||
      (applicantRoleId !== undefined && selectedRoleCodeSet.has(applicantRoleId));
    const roleIds = replacesSelectedRoles ? [roleId] : [...selectedRoleCodes, roleId];

    if (candidate?.technicalCode === "APPLICANT") {
      return { roleIds, implicitRevocationIds: initialRoleCodes };
    }

    const replacesInitialApplicant = applicantRoleId !== undefined && initialRoleCodeSet.has(applicantRoleId);
    return {
      roleIds,
      implicitRevocationIds: replacesInitialApplicant ? [applicantRoleId] : [],
    };
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
                const isPendingAssignment = !initialRoleCodeSet.has(role.roleId);
                const nextRoleCodes = selectedRoleCodes.filter((currentRoleCode) => currentRoleCode !== role.roleId);
                const isInstitutionalAuthority = role.technicalCode === "INSTITUTIONAL_AUTHORITY";
                const isRevokable = !isInstitutionalAuthority || scope === "admin";

                return (
                  <div key={role.roleId} className="flex items-center justify-between gap-3 rounded-lg border p-3">
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
                      onClick={() => removeRole(role.roleId)}
                      disabled={selectedRoleCodes.length <= 1 || !canApplyRoleCodes(nextRoleCodes) || !isRevokable}
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
                const isPendingRevocation = initialRoleCodeSet.has(role.id);
                const roleSelection = getRoleSelection(role.id);

                return (
                  <div key={role.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="font-medium">{role.name}</p>
                      {isPendingRevocation ? (
                        <p className="text-muted-foreground mt-1 text-xs">Se revocará al guardar.</p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => selectRole(role.id)}
                      disabled={!canApplyRoleCodes(roleSelection.roleIds, roleSelection.implicitRevocationIds)}
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

function formatAssignedAt(value: string | undefined): string {
  if (!value) return "Asignación pendiente";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return formatRoleAssignedAt(value);
}
