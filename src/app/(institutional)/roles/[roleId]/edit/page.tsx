import { notFound } from "next/navigation";
import { UserRoundCogIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { InstitutionRoleForm } from "@features/roles/components/institution-role-form";
import {
  fetchInstitutionPermissionGroups,
  fetchInstitutionRole,
} from "@features/roles/services/institution-role.service";

import type { Metadata } from "next";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Editar rol");
}

export default async function EditRolePage({
  params,
  searchParams,
}: {
  params: Promise<{ roleId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const { roleId } = await params;
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, `/roles/${roleId}`);
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_UPDATE)) {
    return <InstitutionalAccessDenied />;
  }
  const [role, permissionGroups] = await Promise.all([
    fetchInstitutionRole(user.institutionId, roleId),
    fetchInstitutionPermissionGroups(user.institutionId),
  ]);
  if (!role) notFound();
  if (!role.editable) {
    return <InstitutionalAccessDenied description="Este rol no se puede modificar." />;
  }
  return (
    <PlatformPageShell
      title={`Editar rol ${role.name}`}
      description="Actualizá el nombre y los permisos concedidos por este rol."
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ [roleId]: role.name }} />}
      headerClassName="flex-row items-end justify-between"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground flex size-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-xs">
          <UserRoundCogIcon className="size-7" />
        </div>
      }
    >
      <InstitutionRoleForm
        institutionId={user.institutionId}
        role={role}
        permissionGroups={permissionGroups}
        returnTo={destination}
      />
    </PlatformPageShell>
  );
}
