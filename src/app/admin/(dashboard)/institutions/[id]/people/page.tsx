import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { parsePeoplePaginationParams, type PeopleSearchParams } from "@features/people/utils/people-pagination.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PeopleSearchForm } from "@features/people/components/people-search-form";
import { PeopleTableContainer } from "@features/people/components/people-table-container";
import { PeopleTableSkeleton } from "@features/people/components/people-table-skeleton";
import { fetchPeople } from "@features/people/services/fetch-people.service";
import { fetchSystemRoles } from "@features/people/services/fetch-system-roles.service";
import { PeopleScope } from "@features/people/utils/people-scope.util";

type PeoplePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<PeopleSearchParams>;
};

export const metadata: Metadata = {
  title: "Lista de usuarios",
};

export default async function InstitutionPeoplePage({
  params,
  searchParams,
}: PeoplePageProps): Promise<React.ReactElement> {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const { page, size, search, sort, roleId } = parsePeoplePaginationParams(resolvedSearchParams);
  const rolesPromise = fetchSystemRoles(id, PeopleScope.ADMIN);
  const peoplePromise = fetchPeople(id, { page, size, search, sort, roleId });
  const [institution, roles] = await Promise.all([fetchInstitution(id), rolesPromise]);
  if (!institution) notFound();

  return (
    <PlatformPageShell
      title="Lista de usuarios"
      description="Creá usuarios, editá sus datos básicos y administrá sus roles."
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />}
      actions={
        <Button asChild size="lg" className="w-full">
          <ReturnToLink href={`/admin/institutions/${id}/people/new`}>
            <PlusIcon data-icon="inline-start" />
            Nuevo usuario
          </ReturnToLink>
        </Button>
      }
    >
      <DataTableNavigationProvider>
        <PeopleSearchForm search={search} size={size} roleId={roleId} roles={roles} />

        <Suspense fallback={<PeopleTableSkeleton />}>
          <PeopleTableContainer
            institutionId={id}
            page={page}
            size={size}
            search={search}
            sort={sort}
            roleId={roleId}
            dataPromise={peoplePromise}
          />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
