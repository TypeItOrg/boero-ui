import { notFound } from "next/navigation";

import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformRoleForm } from "@features/roles/components/platform-role-form";
import { fetchPlatformPermissionGroups, fetchPlatformRole } from "@features/roles/services/platform-role.service";

export const metadata = { title: "Editar rol" };

export default async function EditPlatformRolePage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}): Promise<React.ReactElement> {
  const { roleId } = await params;
  const [role, permissionGroups] = await Promise.all([fetchPlatformRole(roleId), fetchPlatformPermissionGroups()]);
  if (!role?.editable || !role.institution.active) notFound();
  return (
    <PlatformPageShell
      title={`Editar rol ${role.name}`}
      description="Actualizá el nombre y los permisos del rol."
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ roles: "Roles", [roleId]: role.name, edit: "Editar" }} />}
    >
      <PlatformRoleForm role={role} permissionGroups={permissionGroups} />
    </PlatformPageShell>
  );
}
