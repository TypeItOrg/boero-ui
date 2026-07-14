import { Suspense } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { NavigationLink } from "@common/components/ui/navigation-link";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { PlatformAccountsTableContainer } from "@features/platform-accounts/components/platform-accounts-table-container";
import { PlatformAccountsTableFilters } from "@features/platform-accounts/components/platform-accounts-table-filters";
import { PlatformAccountsTableSkeleton } from "@features/platform-accounts/components/platform-accounts-table-skeleton";
import {
  parsePlatformAccountPaginationParams,
  type PlatformAccountSearchParams,
} from "@features/platform-accounts/utils/platform-account-pagination.util";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = {
  title: "Administradores",
  description: "Visualizá y administrá los administradores con acceso global a la plataforma.",
};

type PlatformAccountsPageProps = {
  searchParams: Promise<PlatformAccountSearchParams>;
};

export default async function PlatformAccountsPage({
  searchParams,
}: PlatformAccountsPageProps): Promise<React.ReactElement> {
  const { page, size, search, enabled, sort } = parsePlatformAccountPaginationParams(await searchParams);

  return (
    <PlatformPageShell
      title="Administradores"
      description="Administrá quiénes pueden ingresar y operar en la plataforma."
      breadcrumb={<PlatformBreadcrumb />}
      actions={
        <Button asChild size="lg">
          <NavigationLink href="/platform/accounts/new" pendingLabel="Abriendo nueva cuenta">
            <PlusIcon data-icon="inline-start" />
            Nueva cuenta
          </NavigationLink>
        </Button>
      }
    >
      <DataTableNavigationProvider>
        <PlatformAccountsTableFilters search={search} enabled={enabled} size={size} />

        <Suspense fallback={<PlatformAccountsTableSkeleton />}>
          <PlatformAccountsTableContainer page={page} size={size} search={search} enabled={enabled} sort={sort} />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
