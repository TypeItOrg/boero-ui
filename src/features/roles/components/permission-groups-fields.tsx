"use client";

import { Fragment, useMemo, useState, type ReactElement } from "react";

import { SectionHeader } from "@common/components/section-header";
import { Card, CardContent, CardHeader } from "@common/components/ui/card";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldLabel } from "@common/components/ui/field";

import { PermissionHierarchy } from "@features/roles/components/permission-hierarchy";
import { getPermissionGroupIcon } from "@features/roles/config/permission-group-icons.config";
import type { InstitutionPermissionGroup } from "@features/roles/types/institution-permission-group.types";
import type { InstitutionPermission } from "@features/roles/types/institution-permission.types";
import { getPermissionMap, getPermissionTree } from "@features/roles/utils/permission-hierarchy.util";

const HIDDEN_PERMISSION_GROUP_CODES = new Set(["GRADES"]);

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
}: PermissionGroupsFieldsProps): ReactElement {
  const visibleGroups = useMemo(() => groups.filter((group) => !HIDDEN_PERMISSION_GROUP_CODES.has(group.code)), [groups]);

  const permissions = useMemo(() => getPermissionMap(visibleGroups), [visibleGroups]);

  const [explicitCodes, setExplicitCodes] = useState<Set<string>>(() => new Set(selectedPermissions));

  const selectedCodes = useMemo(() => expandSelectedPermissions(explicitCodes, permissions), [explicitCodes, permissions]);

  const protectedCodeSet = useMemo(() => new Set(protectedPermissions), [protectedPermissions]);

  const requiredCodeSet = useMemo(() => getRequiredPermissionCodes(selectedCodes, permissions), [permissions, selectedCodes]);

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
      {visibleGroups.map((group) => {
        const Icon = getPermissionGroupIcon(group.code);

        const permissionTree = getPermissionTree(group.permissions, permissions);

        return (
          <Card key={group.code} className="bg-background flex-[1_0_min(450px,100%)]">
            <CardHeader className="border-b">
              <SectionHeader icon={Icon} title={group.displayName} description={<span className="line-clamp-1">{group.description}</span>} />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <PermissionHierarchy nodes={permissionTree} renderPermission={renderPermissionField} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  function renderPermissionField(permission: InstitutionPermission): ReactElement {
    const selected = selectedCodes.has(permission.code);

    const protectedPermission = protectedCodeSet.has(permission.code);

    const disabled = !permission.grantable || protectedPermission || requiredCodeSet.has(permission.code);

    const inputId = `${inputIdPrefix}-${permission.code}`;

    return (
      <Fragment key={permission.code}>
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
      </Fragment>
    );
  }
}

function expandSelectedPermissions(selectedPermissions: Iterable<string>, permissions: ReadonlyMap<string, InstitutionPermission>): Set<string> {
  const selectedCodes = new Set(selectedPermissions);

  for (const code of selectedPermissions) {
    addRequiredPermissions(code, selectedCodes, permissions);
  }

  return selectedCodes;
}

function addRequiredPermissions(code: string, selectedCodes: Set<string>, permissions: ReadonlyMap<string, InstitutionPermission>): void {
  const permission = permissions.get(code);

  if (!permission) {
    return;
  }

  for (const requiredCode of permission.requiredPermissions) {
    if (selectedCodes.has(requiredCode)) {
      continue;
    }

    selectedCodes.add(requiredCode);
    addRequiredPermissions(requiredCode, selectedCodes, permissions);
  }
}

function getRequiredPermissionCodes(selectedCodes: ReadonlySet<string>, permissions: ReadonlyMap<string, InstitutionPermission>): Set<string> {
  const requiredCodes = new Set<string>();

  for (const code of selectedCodes) {
    const permission = permissions.get(code);

    if (!permission) {
      continue;
    }

    for (const requiredCode of permission.requiredPermissions) {
      requiredCodes.add(requiredCode);
    }
  }

  return requiredCodes;
}
