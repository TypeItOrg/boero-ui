import { CheckIcon, KeyRoundIcon } from "lucide-react";

import { Card, CardContent, CardHeader } from "@common/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { getPermissionGroupIcon } from "@features/roles/config/permission-group-icons.config";
import { PermissionHierarchy } from "@features/roles/components/permission-hierarchy";
import type { InstitutionPermissionGroup } from "@features/roles/types/institution-permission-group.types";
import type { InstitutionPermission } from "@features/roles/types/institution-permission.types";
import { getPermissionMap, getPermissionTree } from "@features/roles/utils/permission-hierarchy.util";
import { SectionHeader } from "@common/components/section-header";


type InstitutionRolePermissionsProps = {
  permissionCodes: readonly string[];
  groups: readonly InstitutionPermissionGroup[];
};

export function InstitutionRolePermissions({ permissionCodes, groups }: InstitutionRolePermissionsProps): React.ReactElement {
  const assignedPermissionCodes = new Set(permissionCodes);
  const visibleGroups = groups;
  const permissionMap = getPermissionMap(visibleGroups);
  const assignedGroups = visibleGroups
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter((permission) => assignedPermissionCodes.has(permission.code)),
    }))
    .filter((group) => group.permissions.length > 0);

  if (assignedGroups.length === 0) {
    return (
      <Empty className="bg-muted/25 min-h-80 rounded-lg border border-solid px-4 py-12">
        <EmptyHeader className="max-w-md">
          <EmptyMedia variant="icon">
            <KeyRoundIcon className="size-5" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="mt-2 text-base">Sin permisos asignados</EmptyTitle>
          <EmptyDescription>Este rol todavía no concede acceso a ninguna operación.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-wrap items-stretch gap-4">
      {assignedGroups.map((group) => {
        const Icon = getPermissionGroupIcon(group.code);

        return (
          <Card key={group.code} className="bg-muted/25 flex-[1_0_min(450px,100%)]">
            <CardHeader className="border-b">
              <SectionHeader icon={Icon} title={group.displayName} description={<span className="line-clamp-1">{group.description}</span>} />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <PermissionHierarchy nodes={getPermissionTree(group.permissions, permissionMap)} renderPermission={renderPermissionRow} />
            </CardContent>
          </Card>
        );
      })}
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
