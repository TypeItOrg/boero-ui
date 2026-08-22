import { Suspense } from "react";
import { PlusIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { InstitutionsTableFilters } from "@features/institutions/components/institutions-table-filters";
import { InstitutionsTableContainer } from "@features/institutions/components/institutions-table-container";
import { InstitutionsTableSkeleton } from "@features/institutions/components/institutions-table-skeleton";
import { parseInstitutionPaginationParams, type InstitutionSearchParams } from "@features/institutions/utils/institution-pagination.util";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = {
  title: "Instituciones",
  description: "Visualizá, buscá y administrá todas las instituciones registradas en la plataforma.",
};

type PageProps = {
  searchParams: Promise<InstitutionSearchParams>;
};

export default async function InstitutionsPage({ searchParams }: PageProps): Promise<React.ReactElement> {
  const { page, size, search, active, sort } = parseInstitutionPaginationParams(await searchParams);

  return (
    <PlatformPageShell
      title="Instituciones"
      breadcrumb={<PlatformBreadcrumb />}
      actions={
        <Button asChild size="lg" className="w-full">
          <ReturnToLink href="/admin/institutions/new">
            <PlusIcon data-icon="inline-start" />
            Nueva Institución
          </ReturnToLink>
        </Button>
      }
    >
      <DataTableNavigationProvider>
        <InstitutionsTableFilters search={search} active={active} size={size} />

        <Suspense fallback={<InstitutionsTableSkeleton />}>
          <InstitutionsTableContainer page={page} size={size} search={search} active={active} sort={sort} />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
