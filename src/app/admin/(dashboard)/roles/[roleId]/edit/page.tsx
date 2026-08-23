import { notFound } from "next/navigation";
import Link from "next/link";
import { UserRoundCogIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
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
      title="Editar Rol"
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ roles: "Roles", [roleId]: role.name, edit: "Editar" }} />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <UserRoundCogIcon className="size-6 sm:size-7" aria-hidden="true" />
        </div>
      }
    >
      <div>
        <Button asChild variant="outline" size="lg">
          <Link href={destination}>Volver</Link>
        </Button>
      </div>
      <PlatformRoleForm role={role} permissionGroups={permissionGroups} returnTo={destination} />
    </PlatformPageShell>
  );
}
