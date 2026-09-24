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

export default async function MyDependentsPage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!canManageDependents(user)) {
    return <InstitutionalAccessDenied description="No tenés permisos para gestionar personas a cargo." />;
  }

  const dependents = await fetchGuardianDependents(user.institutionId);

  return (
    <PlatformPageShell title="Mis personas a cargo" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={UsersIcon} />}>
      <GuardianDependentsList dependents={dependents} institutionId={user.institutionId} />
    </PlatformPageShell>
  );
}
