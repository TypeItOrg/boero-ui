import type { Metadata } from "next";
import { Suspense } from "react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import type { PaginationSearchParams } from "@common/types/pagination-search-params.types";
import { InstitutionalAccountHeader } from "@features/institutional-auth/components/institutional-account-header";
import { InstitutionalSessionsTableContainer } from "@features/institutional-auth/components/institutional-sessions-table-container";
import { InstitutionalSessionsTableSkeleton } from "@features/institutional-auth/components/institutional-sessions-table-skeleton";
import { fetchInstitutionalSessions } from "@features/institutional-auth/services/fetch-institutional-sessions.service";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { parseSessionsPaginationParams } from "@features/institutional-auth/utils/session-pagination.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Sesiones");
}

export default async function SessionsPage({ searchParams }: { searchParams: Promise<PaginationSearchParams> }): Promise<React.ReactElement> {
  const resolvedSearchParams = await searchParams;
  const { page, size } = parseSessionsPaginationParams(resolvedSearchParams);
  const sessionsPromise = fetchInstitutionalSessions({ page, size });

  return (
    <>
      <InstitutionalAccountHeader />
      <DataTableNavigationProvider>
        <Suspense fallback={<InstitutionalSessionsTableSkeleton />}>
          <InstitutionalSessionsTableContainer dataPromise={sessionsPromise} page={page} size={size} />
        </Suspense>
      </DataTableNavigationProvider>
    </>
  );
}
