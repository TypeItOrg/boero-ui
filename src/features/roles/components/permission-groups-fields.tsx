"use client";

import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldLabel } from "@common/components/ui/field";
import { getPermissionGroupIcon } from "@features/roles/config/permission-group-icons.config";
import type { InstitutionPermissionGroup } from "@features/roles/types/institution-permission-group.types";
import type { InstitutionPermission } from "@features/roles/types/institution-permission.types";
import { PermissionHierarchy } from "@features/roles/components/permission-hierarchy";
import { getPermissionMap, getPermissionTree } from "@features/roles/utils/permission-hierarchy.util";

type PermissionGroupsFieldsProps = {
  groups: readonly InstitutionPermissionGroup[];
  selectedPermissions?: readonly string[];
  protectedPermissions?: readonly string[];
  inputIdPrefix?: string;
};

export function PermissionGroupsFields({
  groups,
  selectedPermissions = [],
  protectedPermissions = [],
  inputIdPrefix = "permission",
}: PermissionGroupsFieldsProps): React.ReactElement {
  const permissions = React.useMemo(() => getPermissionMap(groups), [groups]);
  const [explicitCodes, setExplicitCodes] = React.useState<Set<string>>(() => new Set(selectedPermissions));
  const selectedCodes = React.useMemo(
    () => expandSelectedPermissions(explicitCodes, permissions),
    [explicitCodes, permissions],
  );
  const protectedCodeSet = React.useMemo(() => new Set(protectedPermissions), [protectedPermissions]);
  const requiredCodeSet = React.useMemo(
    () => getRequiredPermissionCodes(selectedCodes, permissions),
    [permissions, selectedCodes],
  );

  function handlePermissionChange(code: string, checked: boolean): void {
    setExplicitCodes((currentCodes) => {
      const nextCodes = new Set(currentCodes);
      if (checked) {
        nextCodes.add(code);
      } else {
        nextCodes.delete(code);
      }
      return nextCodes;
    });
  }

  return (
    <div className="flex flex-wrap items-stretch gap-4">
      {groups.map((group) => {
        const Icon = getPermissionGroupIcon(group.code);
        const permissionTree = getPermissionTree(group.permissions, permissions);

        return (
          <Card key={group.code} className="bg-background flex-[1_0_min(450px,100%)]">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3.5">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <CardTitle>{group.displayName}</CardTitle>
                  <CardDescription className="line-clamp-1">{group.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <PermissionHierarchy nodes={permissionTree} renderPermission={renderPermissionField} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  function renderPermissionField(permission: InstitutionPermission): React.ReactElement {
    const selected = selectedCodes.has(permission.code);
    const protectedPermission = protectedCodeSet.has(permission.code);
    const disabled = !permission.grantable || protectedPermission || requiredCodeSet.has(permission.code);
    const inputId = `${inputIdPrefix}-${permission.code}`;

    return (
      <React.Fragment key={permission.code}>
        {disabled && selected ? <input type="hidden" name="permissions" value={permission.code} /> : null}
        <Field orientation="horizontal" data-disabled={disabled}>
          <Checkbox
            id={inputId}
            name="permissions"
            value={permission.code}
            checked={selected}
            disabled={disabled}
            onCheckedChange={(checked) => handlePermissionChange(permission.code, checked === true)}
          />
          <FieldLabel htmlFor={inputId} className="font-normal">
            {permission.description}
          </FieldLabel>
        </Field>
      </React.Fragment>
    );
  }
}

function expandSelectedPermissions(
  selectedPermissions: Iterable<string>,
  permissions: ReadonlyMap<string, InstitutionPermission>,
): Set<string> {
  const selectedCodes = new Set(selectedPermissions);
  for (const code of selectedPermissions) {
    addRequiredPermissions(code, selectedCodes, permissions);
  }
  return selectedCodes;
}

function addRequiredPermissions(
  code: string,
  selectedCodes: Set<string>,
  permissions: ReadonlyMap<string, InstitutionPermission>,
): void {
  const permission = permissions.get(code);
  if (!permission) return;

  for (const requiredCode of permission.requiredPermissions) {
    if (selectedCodes.has(requiredCode)) continue;
    selectedCodes.add(requiredCode);
    addRequiredPermissions(requiredCode, selectedCodes, permissions);
  }
}

function getRequiredPermissionCodes(
  selectedCodes: ReadonlySet<string>,
  permissions: ReadonlyMap<string, InstitutionPermission>,
): Set<string> {
  const requiredCodes = new Set<string>();
  for (const code of selectedCodes) {
    const permission = permissions.get(code);
    if (!permission) continue;
    for (const requiredCode of permission.requiredPermissions) {
      requiredCodes.add(requiredCode);
    }
  }
  return requiredCodes;
}
