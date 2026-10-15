import type { ReactElement } from "react";

import type { Metadata } from "next";

import { UsersIcon } from "lucide-react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";

import { GuardianDependentsList } from "@features/guardian-dependents/components/guardian-dependents-list";
import { fetchGuardianDependentsPage } from "@features/guardian-dependents/services/guardian-dependent.service";
import { parseGuardianDependentsQuery } from "@features/guardian-dependents/utils/guardian-dependents-query.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { canManageDependents } from "@features/institutional-auth/utils/institutional-applicant-role.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Personas a cargo");
}

type MyDependentsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function MyDependentsPage({ searchParams }: MyDependentsPageProps): Promise<ReactElement> {
  const user = await requireInstitutionalUser();

  if (!canManageDependents(user)) {
    return <InstitutionalAccessDenied description="No tenés permisos para gestionar personas a cargo." />;
  }

  const query = parseGuardianDependentsQuery(await searchParams);

  let data = await fetchGuardianDependentsPage(user.institutionId, query);

  if (query.page > 0 && query.page >= data.totalPages) {
    query.page = Math.max(0, data.totalPages - 1);
    data = await fetchGuardianDependentsPage(user.institutionId, query);
  }

  return (
    <PlatformPageShell title="Personas a cargo" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={UsersIcon} />}>
      <DataTableNavigationProvider>
        <GuardianDependentsList data={data} query={query} institutionId={user.institutionId} />
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
