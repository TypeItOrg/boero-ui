import { notFound } from "next/navigation";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformRoleForm } from "@features/roles/components/platform-role-form";
import { fetchPlatformPermissionGroups, fetchPlatformRole } from "@features/roles/services/platform-role.service";

export const metadata = { title: "Editar rol" };

export default async function EditPlatformRolePage({
  params,
  searchParams,
}: {
  params: Promise<{ roleId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const { roleId } = await params;
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, `/admin/roles/${roleId}`);
  const [role, permissionGroups] = await Promise.all([fetchPlatformRole(roleId), fetchPlatformPermissionGroups()]);
  if (!role?.editable || !role.institution.active) notFound();
  return (
    <PlatformPageShell
      title={`Editar rol ${role.name}`}
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ roles: "Roles", [roleId]: role.name, edit: "Editar" }} />}
    >
      <PlatformRoleForm role={role} permissionGroups={permissionGroups} returnTo={destination} />
    </PlatformPageShell>
  );
}
