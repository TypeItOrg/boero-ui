import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { NavigationLink } from "@common/components/ui/navigation-link";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { isHttpStatusError } from "@common/utils/create-http-error.util";
import { parsePeoplePaginationParams, type PeopleSearchParams } from "@features/people/utils/people-pagination.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PeopleSearchForm } from "@features/people/components/people-search-form";
import { PeopleTableContainer } from "@features/people/components/people-table-container";
import { PeopleTableSkeleton } from "@features/people/components/people-table-skeleton";

type PeoplePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<PeopleSearchParams>;
};

export default async function InstitutionPeoplePage({
  params,
  searchParams,
}: PeoplePageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const { page, size, search, sort } = parsePeoplePaginationParams(await searchParams);
  const institution = await getInstitutionOrNotFound(id);

  return (
    <PlatformPageShell
      title={`Lista de Usuarios`}
      description="Creá usuarios, editá sus datos básicos y administrá sus roles."
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: institution.name }} />}
      actions={
        <Button asChild size="lg">
          <NavigationLink href={`/platform/institutions/${id}/people/new`} pendingLabel="Abriendo nuevo usuario">
            <PlusIcon data-icon="inline-start" />
            Nuevo usuario
          </NavigationLink>
        </Button>
      }
    >
      <DataTableNavigationProvider>
        <PeopleSearchForm search={search} size={size} />

        <Suspense fallback={<PeopleTableSkeleton />}>
          <PeopleTableContainer institutionId={id} page={page} size={size} search={search} sort={sort} />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}

async function getInstitutionOrNotFound(id: string): Promise<Awaited<ReturnType<typeof fetchInstitution>>> {
  try {
    return await fetchInstitution(id);
  } catch (error) {
    if (isHttpStatusError(error, 404)) {
      notFound();
    }

    throw error;
  }
}
