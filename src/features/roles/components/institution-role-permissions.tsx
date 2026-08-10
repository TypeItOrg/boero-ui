import { CheckIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { PermissionHierarchy } from "@features/roles/components/permission-hierarchy";
import type { InstitutionPermissionGroup } from "@features/roles/types/institution-permission-group.types";
import type { InstitutionPermission } from "@features/roles/types/institution-permission.types";
import { getPermissionMap, getPermissionTree } from "@features/roles/utils/permission-hierarchy.util";

type InstitutionRolePermissionsProps = {
  permissionCodes: readonly string[];
  groups: readonly InstitutionPermissionGroup[];
};

export function InstitutionRolePermissions({
  permissionCodes,
  groups,
}: InstitutionRolePermissionsProps): React.ReactElement {
  const assignedPermissionCodes = new Set(permissionCodes);
  const permissionMap = getPermissionMap(groups);
  const assignedGroups = groups
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter((permission) => assignedPermissionCodes.has(permission.code)),
    }))
    .filter((group) => group.permissions.length > 0);

  if (assignedGroups.length === 0) {
    return (
      <Card className="bg-muted/25">
        <CardHeader>
          <CardTitle>Sin permisos asignados</CardTitle>
          <CardDescription>Este rol todavía no concede acceso a ninguna operación.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-wrap items-stretch gap-4">
      {assignedGroups.map((group) => (
        <Card key={group.code} className="bg-muted/25 flex-[1_0_min(450px,100%)]">
          <CardHeader>
            <CardTitle>{group.displayName}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <PermissionHierarchy
              nodes={getPermissionTree(group.permissions, permissionMap)}
              renderPermission={renderPermissionRow}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function renderPermissionRow(permission: InstitutionPermission): React.ReactElement {
  return (
    <div key={permission.code} className="flex items-start gap-3 text-sm">
      <span className="bg-primary/10 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
        <CheckIcon className="size-3.5" />
      </span>
      <span>{permission.description}</span>
    </div>
  );
}
