import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { parsePaginationQuery } from "@common/utils/pagination-query.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { fetchInstitutionRoles } from "@features/roles/services/institution-role.service";
import { InstitutionRolesTableFilters } from "@features/roles/components/institution-roles-table-filters";
import { InstitutionRolesTablePresentation } from "@features/roles/components/institution-roles-table-presentation";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Roles");
}

export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_READ)) {
    return <InstitutionalAccessDenied />;
  }
  const params = parsePaginationQuery(await searchParams);
  const roles = await fetchInstitutionRoles(user.institutionId, params);
  const canCreate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_CREATE);
  const canUpdate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_UPDATE);

  return (
    <PlatformPageShell
      title="Roles"
      description="Definí las responsabilidades y accesos de tu equipo."
      breadcrumb={<InstitutionalBreadcrumb />}
      actions={
        canCreate ? (
          <Button asChild size="lg" className="w-full">
            <ReturnToLink href="/roles/new">
              <PlusIcon data-icon="inline-start" />
              Nuevo rol
            </ReturnToLink>
          </Button>
        ) : undefined
      }
    >
      <DataTableNavigationProvider>
        <InstitutionRolesTableFilters search={params.search} size={params.size} />
        <InstitutionRolesTablePresentation roles={roles} search={params.search} canUpdate={canUpdate} />
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
