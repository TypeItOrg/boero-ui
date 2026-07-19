import { notFound } from "next/navigation";
import { UserRoundPlusIcon } from "lucide-react";

import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { InstitutionRoleForm } from "@features/roles/components/institution-role-form";
import { fetchInstitutionPermissionGroups } from "@features/roles/services/institution-role.service";

export const metadata = { title: "Nuevo rol" };

export default async function NewRolePage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_CREATE)) notFound();
  const permissionGroups = await fetchInstitutionPermissionGroups(user.institutionId);

  return (
    <PlatformPageShell
      title="Nuevo rol"
      description="Creá un rol adaptado a la organización de tu institución."
      breadcrumb={<InstitutionalBreadcrumb />}
      headerClassName="flex-row items-end justify-between"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground flex size-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-xs">
          <UserRoundPlusIcon className="size-7" />
        </div>
      }
    >
      <InstitutionRoleForm permissionGroups={permissionGroups} />
    </PlatformPageShell>
  );
}
