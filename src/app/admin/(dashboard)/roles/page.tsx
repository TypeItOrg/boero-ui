import { Suspense } from "react";
import { PlusIcon, UserLockIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformCollectionActions } from "@features/platform-auth/components/platform-collection-actions";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformRolesTableContainer } from "@features/roles/components/platform-roles-table-container";
import { PlatformRolesTableFilters } from "@features/roles/components/platform-roles-table-filters";
import { PlatformRolesTableSkeleton } from "@features/roles/components/platform-roles-table-skeleton";
import { fetchPlatformRoles } from "@features/roles/services/platform-role.service";
import { parsePlatformRolesPaginationParams, type PlatformRolesSearchParams } from "@features/roles/utils/platform-role-pagination.util";

export const metadata = {
  title: "Roles",
  description: "Consultá y administrá los roles de todas las instituciones.",
};

export default async function PlatformRolesPage({ searchParams }: { searchParams: Promise<PlatformRolesSearchParams> }): Promise<React.ReactElement> {
  const params = parsePlatformRolesPaginationParams(await searchParams);
  const rolesPromise = fetchPlatformRoles(params);
  const institutionNamePromise = getInstitutionName(params.institutionId);
  const institutionName = await institutionNamePromise;

  return (
    <PlatformPageShell title="Roles" breadcrumb={<PlatformBreadcrumb />} actions={<PlatformPageIcon icon={UserLockIcon} />}>
      <PlatformCollectionActions>
        <Button asChild size="lg" className="w-full">
          <ReturnToLink href="/admin/roles/new">
            <PlusIcon data-icon="inline-start" />
            Nuevo rol
          </ReturnToLink>
        </Button>
      </PlatformCollectionActions>
      <DataTableNavigationProvider>
        <PlatformRolesTableFilters
          institutionId={params.institutionId}
          institutionName={institutionName}
          roleType={params.roleType}
          search={params.search}
          size={params.size}
        />
        <Suspense fallback={<PlatformRolesTableSkeleton />}>
          <PlatformRolesTableContainer {...params} dataPromise={rolesPromise} />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}

async function getInstitutionName(institutionId: string | undefined): Promise<string | undefined> {
  if (!institutionId) return undefined;
  const institution = await fetchInstitution(institutionId);
  return institution?.name;
}
