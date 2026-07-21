"use client";

import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldLabel } from "@common/components/ui/field";
import { cn } from "@common/utils/cn.util";
import type { InstitutionPermission, InstitutionPermissionGroup } from "@features/roles/types/institution-role.types";
import {
  getPermissionIndentClass,
  getPermissionMap,
  getPermissionRows,
} from "@features/roles/utils/permission-hierarchy.util";

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
        const permissionRows = getPermissionRows(group.permissions, permissions);
        const rootRows = permissionRows.filter(({ depth }) => depth === 0);
        const nestedRows = permissionRows.filter(({ depth }) => depth > 0);

        return (
          <Card key={group.code} className="bg-muted/25 flex-[1_0_min(450px,100%)]">
            <CardHeader>
              <CardTitle>{group.displayName}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {rootRows.map(({ permission }) => renderPermissionField(permission))}
              {nestedRows.length > 0 ? (
                <div className="border-border/50 ml-6 flex flex-col gap-3 border-l pl-3">
                  {nestedRows.map(({ permission, depth }) => (
                    <div key={permission.code} className={cn(getPermissionIndentClass(depth - 1))}>
                      {renderPermissionField(permission)}
                    </div>
                  ))}
                </div>
              ) : null}
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
