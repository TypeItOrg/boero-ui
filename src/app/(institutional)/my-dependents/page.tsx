import type { Metadata } from "next";
import { UsersIcon } from "lucide-react";

import { GuardianDependentsList } from "@features/guardian-dependents/components/guardian-dependents-list";
import { fetchGuardianDependents } from "@features/guardian-dependents/services/guardian-dependent.service";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { canManageDependents } from "@features/institutional-auth/utils/institutional-applicant-role.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Mis personas a cargo");
}

const MAX_SEARCH_LENGTH = 100;

type MyDependentsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function MyDependentsPage({ searchParams }: MyDependentsPageProps): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!canManageDependents(user)) {
    return <InstitutionalAccessDenied description="No tenés permisos para gestionar personas a cargo." />;
  }

  const { search } = await searchParams;
  const initialSearch = typeof search === "string" ? search.trim().slice(0, MAX_SEARCH_LENGTH) : "";
  const dependents = await fetchGuardianDependents(user.institutionId);

  return (
    <PlatformPageShell title="Mis personas a cargo" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={UsersIcon} />}>
      <GuardianDependentsList key={initialSearch} dependents={dependents} initialSearch={initialSearch} institutionId={user.institutionId} />
    </PlatformPageShell>
  );
}
