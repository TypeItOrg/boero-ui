import { notFound } from "next/navigation";

import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformRoleForm } from "@features/roles/components/platform-role-form";
import { fetchPlatformPermissionGroups } from "@features/roles/services/platform-role.service";

export const metadata = { title: "Nuevo rol" };

export default async function NewPlatformRolePage(): Promise<React.ReactElement> {
  const permissionGroups = await fetchPlatformPermissionGroups();
  if (!permissionGroups.length) notFound();
  return (
    <PlatformPageShell
      title="Nuevo rol"
      description="Creá un rol para una institución."
      breadcrumb={<PlatformBreadcrumb />}
    >
      <PlatformRoleForm permissionGroups={permissionGroups} />
    </PlatformPageShell>
  );
}
