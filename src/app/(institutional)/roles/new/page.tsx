import { UserRoundPlusIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { InstitutionRoleForm } from "@features/roles/components/institution-role-form";
import { fetchInstitutionPermissionGroups } from "@features/roles/services/institution-role.service";

import type { Metadata } from "next";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Nuevo rol");
}

export default async function NewRolePage({ searchParams }: { searchParams: Promise<{ returnTo?: QueryParamValue }> }): Promise<React.ReactElement> {
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, "/roles");
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_CREATE)) {
    return <InstitutionalAccessDenied />;
  }
  const permissionGroups = await fetchInstitutionPermissionGroups(user.institutionId);

  return (
    <PlatformPageShell
      title="Nuevo rol"
      breadcrumb={<InstitutionalBreadcrumb />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <UserRoundPlusIcon className="size-6 sm:size-7" />
        </div>
      }
    >
      <InstitutionRoleForm institutionId={user.institutionId} permissionGroups={permissionGroups} returnTo={destination} />
    </PlatformPageShell>
  );
}
