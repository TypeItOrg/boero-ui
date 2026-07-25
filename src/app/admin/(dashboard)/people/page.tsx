import { Suspense } from "react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformPeopleTableContainer } from "@features/people/components/platform-people-table-container";
import { PlatformPeopleTableFilters } from "@features/people/components/platform-people-table-filters";
import { PlatformPeopleTableSkeleton } from "@features/people/components/platform-people-table-skeleton";
import { fetchPlatformPeople } from "@features/people/services/fetch-platform-people.service";
import { fetchSystemRolesCatalog } from "@features/people/services/fetch-system-roles.service";
import {
  parsePlatformPeoplePaginationParams,
  type PlatformPeopleSearchParams,
} from "@features/people/utils/platform-people-pagination.util";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = {
  title: "Usuarios",
  description: "Consultá los usuarios registrados en todas las instituciones.",
};

type PlatformPeoplePageProps = {
  searchParams: Promise<PlatformPeopleSearchParams>;
};

export default async function PlatformPeoplePage({
  searchParams,
}: PlatformPeoplePageProps): Promise<React.ReactElement> {
  const params = parsePlatformPeoplePaginationParams(await searchParams);
  const peoplePromise = fetchPlatformPeople(params);
  const [roleList, selectedInstitutionName] = await Promise.all([
    fetchSystemRolesCatalog(),
    getSelectedInstitutionName(params.institutionId),
  ]);

  return (
    <PlatformPageShell
      title="Usuarios"
      description="Consultá los usuarios de todas las instituciones y accedé a su gestión."
      breadcrumb={<PlatformBreadcrumb />}
    >
      <DataTableNavigationProvider>
        <PlatformPeopleTableFilters
          institutionId={params.institutionId}
          institutionName={selectedInstitutionName}
          roleCode={params.roleCode}
          roles={roleList.roles}
          search={params.search}
          size={params.size}
        />

        <Suspense fallback={<PlatformPeopleTableSkeleton />}>
          <PlatformPeopleTableContainer {...params} dataPromise={peoplePromise} />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}

async function getSelectedInstitutionName(institutionId: string | undefined): Promise<string | undefined> {
  if (!institutionId) return undefined;

  const institution = await fetchInstitution(institutionId);
  return institution?.name;
}
