import { notFound } from "next/navigation";
import { UserRoundPlusIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformRoleForm } from "@features/roles/components/platform-role-form";
import { fetchPlatformPermissionGroups } from "@features/roles/services/platform-role.service";

export const metadata = { title: "Nuevo rol" };

export default async function NewPlatformRolePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, "/admin/roles");
  const permissionGroups = await fetchPlatformPermissionGroups();
  if (!permissionGroups.length) notFound();
  return (
    <PlatformPageShell
      title="Nuevo rol"
      breadcrumb={<PlatformBreadcrumb />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<PlatformPageIcon icon={UserRoundPlusIcon} />}
    >
      <PlatformRoleForm permissionGroups={permissionGroups} returnTo={destination} />
    </PlatformPageShell>
  );
}
