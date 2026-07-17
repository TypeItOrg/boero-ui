import { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { parsePeoplePaginationParams, type PeopleSearchParams } from "@features/people/utils/people-pagination.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PeopleSearchForm } from "@features/people/components/people-search-form";
import { PeopleTableContainer } from "@features/people/components/people-table-container";
import { PeopleTableSkeleton } from "@features/people/components/people-table-skeleton";
import { fetchPeople } from "@features/people/services/fetch-people.service";

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
  const { page, size, search, sort } = parsePeoplePaginationParams(resolvedSearchParams);
  const peoplePromise = fetchPeople(id, { page, size, search, sort });
  const institution = await fetchInstitution(id);
  if (!institution) notFound();

  return (
    <PlatformPageShell
      title={`Lista de Usuarios`}
      description="Creá usuarios, editá sus datos básicos y administrá sus roles."
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />}
      actions={
        <Button asChild size="lg">
          <Link href={`/admin/institutions/${id}/people/new`}>
            <PlusIcon data-icon="inline-start" />
            Nuevo usuario
          </Link>
        </Button>
      }
    >
      <DataTableNavigationProvider>
        <PeopleSearchForm search={search} size={size} />

        <Suspense fallback={<PeopleTableSkeleton />}>
          <PeopleTableContainer
            institutionId={id}
            page={page}
            size={size}
            search={search}
            sort={sort}
            dataPromise={peoplePromise}
          />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
