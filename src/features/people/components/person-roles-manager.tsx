"use client";

import { useMemo, type ReactElement } from "react";

import { PlusIcon, ShieldCheckIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Button } from "@common/components/ui/button";

import { PersonAssignedRoleCard } from "@features/people/components/person-assigned-role-card";
import { type PersonRolesManagerProps } from "@features/people/types/person-roles-manager-props.types";
import { SystemRoleCode } from "@features/people/types/system-role-code.types";
import { PeopleScope } from "@features/people/utils/people-scope.util";
import { getRoleChanges } from "@features/people/utils/person-role-rules.util";
import { getSelectedRoles } from "@features/people/utils/selected-person-roles.util";

export function PersonRolesManager({
  institutionId,
  assignments,
  onAssignmentChange,
  disabled = false,
  roles,
  assignedRoles,
  selectedRoleCodes,
  onSelectedRoleCodesChange,
  canAssignRoles,
  canRevokeRoles,
  scope = PeopleScope.ADMIN,
}: PersonRolesManagerProps): ReactElement {
  const initialRoleCodes = useMemo(() => assignedRoles.map((role) => role.roleId), [assignedRoles]);
  const initialRoleCodeSet = useMemo(() => new Set(initialRoleCodes), [initialRoleCodes]);
  const selectedRoleCodeSet = useMemo(() => new Set(selectedRoleCodes), [selectedRoleCodes]);
  const assignedRolesByCode = useMemo(() => new Map(assignedRoles.map((role) => [role.roleId, role])), [assignedRoles]);
  const rolesByCode = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);
  const selectedRoles = useMemo(
    () => getSelectedRoles(selectedRoleCodeSet, rolesByCode, assignedRolesByCode),
    [assignedRolesByCode, rolesByCode, selectedRoleCodeSet],
  );
  const availableRoles = roles.filter((role) => !selectedRoleCodeSet.has(role.id));
  const protectedRoleIds = useMemo(
    () =>
      PeopleScope.isInstitutional(scope)
        ? new Set(assignedRoles.filter((role) => role.technicalCode === SystemRoleCode.INSTITUTIONAL_AUTHORITY).map((role) => role.roleId))
        : new Set<string>(),
    [assignedRoles, scope],
  );
  const applicantRoleId = roles.find((role) => role.technicalCode === SystemRoleCode.APPLICANT)?.id;

  function selectRole(roleId: string): void {
    if (selectedRoleCodeSet.has(roleId)) {
      return;
    }

    const roleSelection = getRoleSelection(roleId);

    if (!canApplyRoleCodes(roleSelection.roleIds)) {
      return;
    }

    onSelectedRoleCodesChange(roleSelection.roleIds);
  }

  function removeRole(roleCode: string): void {
    if (selectedRoleCodes.length <= 1) {
      return;
    }

    const nextRoleCodes = selectedRoleCodes.filter((currentRoleCode) => currentRoleCode !== roleCode);

    if (!canApplyRoleCodes(nextRoleCodes)) {
      return;
    }

    onSelectedRoleCodesChange(nextRoleCodes);
  }

  function canApplyRoleCodes(nextRoleCodes: readonly string[]): boolean {
    const preservesProtectedRoles = Array.from(protectedRoleIds).every((roleId) => nextRoleCodes.includes(roleId));

    if (!preservesProtectedRoles) {
      return false;
    }

    const roleChanges = getRoleChanges(initialRoleCodes, nextRoleCodes);
    const requiresExplicitRevocation = roleChanges.revocations.length > 0;
    const canAssign = roleChanges.assignments.length === 0 || canAssignRoles;
    const canRevoke = !requiresExplicitRevocation || canRevokeRoles;

    return canAssign && canRevoke;
  }

  function getRoleSelection(roleId: string): {
    roleIds: string[];
  } {
    const candidate = rolesByCode.get(roleId);
    const replacesSelectedRoles =
      candidate?.technicalCode === SystemRoleCode.APPLICANT || (applicantRoleId !== undefined && selectedRoleCodeSet.has(applicantRoleId));
    const roleIds = replacesSelectedRoles ? [roleId] : [...selectedRoleCodes, roleId];

    return { roleIds };
  }

  return (
    <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
      <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
        <SectionHeader icon={ShieldCheckIcon} title="Roles institucionales" description="Los cambios de roles se aplican al guardar el usuario." />
      </header>
      <div className="mt-4 flex flex-col gap-5 sm:mt-5">
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Roles asignados</h3>
          {selectedRoles.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selectedRoles.map((role) => {
                const isPendingAssignment = !initialRoleCodeSet.has(role.roleId);
                const nextRoleCodes = selectedRoleCodes.filter((currentRoleCode) => currentRoleCode !== role.roleId);
                const isInstitutionalAuthority = role.technicalCode === SystemRoleCode.INSTITUTIONAL_AUTHORITY;
                const isRevokable = !isInstitutionalAuthority || PeopleScope.isAdmin(scope);

                return (
                  <PersonAssignedRoleCard
                    key={role.roleId}
                    role={role}
                    isPendingAssignment={isPendingAssignment}
                    removeRole={removeRole}
                    disabled={disabled}
                    selectedRoleCodes={selectedRoleCodes}
                    canApplyRoleCodes={canApplyRoleCodes}
                    nextRoleCodes={nextRoleCodes}
                    isRevokable={isRevokable}
                    institutionId={institutionId}
                    onAssignmentChange={onAssignmentChange}
                    assignments={assignments}
                    rolesByCode={rolesByCode}
                    scope={scope}
                    assignedRolesByCode={assignedRolesByCode}
                    canAssignRoles={canAssignRoles}
                    canRevokeRoles={canRevokeRoles}
                    isInstitutionalAuthority={isInstitutionalAuthority}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground rounded-lg border p-4 text-sm">Este usuario no tendrá roles asignados.</p>
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
                      {isPendingRevocation ? <p className="text-muted-foreground mt-1 text-xs">Se revocará al guardar.</p> : null}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => selectRole(role.id)}
                      disabled={disabled || !canApplyRoleCodes(roleSelection.roleIds)}
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
      </div>
    </div>
  );
}
