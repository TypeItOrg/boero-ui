import { Suspense, type ReactElement } from "react";

import type { Metadata } from "next";

import { ClipboardListIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";

import { EnrollmentApplicationFilters } from "@features/enrollment-applications/components/enrollment-application-filters";
import { EnrollmentApplicationTableSkeleton } from "@features/enrollment-applications/components/enrollment-application-table-skeleton";
import { MyEnrollmentApplicationTableContainer } from "@features/enrollment-applications/components/my-enrollment-application-table";
import { fetchMyEnrollmentApplications } from "@features/enrollment-applications/services/enrollment-application.service";
import {
  parseEnrollmentApplicationPaginationParams,
  type EnrollmentApplicationSearchParams,
} from "@features/enrollment-applications/utils/enrollment-application-pagination.util";
import { fetchGuardianDependents } from "@features/guardian-dependents/services/guardian-dependent.service";
import { getGuardianWorkspaceId } from "@features/guardian-workspace/utils/guardian-workspace-cookie.util";
import { resolveGuardianWorkspaceDependent } from "@features/guardian-workspace/utils/resolve-guardian-workspace-dependent.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { canViewOwnEnrollmentApplications, isGuardian } from "@features/institutional-auth/utils/institutional-applicant-role.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Mis inscripciones");
}

export default async function MyEnrollmentApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<EnrollmentApplicationSearchParams>;
}): Promise<ReactElement> {
  const user = await requireInstitutionalUser();

  if (!canViewOwnEnrollmentApplications(user)) {
    return <InstitutionalAccessDenied description="No tenés inscripciones como postulante." />;
  }

  const resolvedSearchParams = await searchParams;

  const { page, size, status } = parseEnrollmentApplicationPaginationParams(resolvedSearchParams);

  const guardianOnly = isGuardian(user);

  const dependents = guardianOnly ? await fetchGuardianDependents(user.institutionId) : [];

  const workspaceId = guardianOnly ? await getGuardianWorkspaceId() : undefined;

  const selectedDependent = resolveGuardianWorkspaceDependent(dependents, workspaceId);

  if (guardianOnly && dependents.length === 0) {
    return (
      <PlatformPageShell title="Mis inscripciones" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={ClipboardListIcon} />}>
        <Alert>
          <AlertTitle>Todavía no tenés personas a cargo</AlertTitle>
          <AlertDescription>Agregá una persona a cargo para consultar sus inscripciones.</AlertDescription>
        </Alert>
      </PlatformPageShell>
    );
  }

  if (guardianOnly && !selectedDependent) {
    return (
      <PlatformPageShell title="Mis inscripciones" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={ClipboardListIcon} />}>
        <Alert>
          <AlertTitle>Seleccioná una persona a cargo</AlertTitle>
          <AlertDescription>Elegí una persona a cargo desde el selector de cuenta para consultar sus inscripciones.</AlertDescription>
        </Alert>
      </PlatformPageShell>
    );
  }

  const dataPromise = fetchMyEnrollmentApplications(user.institutionId, {
    page,
    size,
    status,
    dependentPersonId: selectedDependent?.dependentPersonId,
  });

  return (
    <PlatformPageShell title="Mis inscripciones" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={ClipboardListIcon} />}>
      <DataTableNavigationProvider>
        <EnrollmentApplicationFilters status={status} size={size} />
        <Suspense fallback={<EnrollmentApplicationTableSkeleton />}>
          <MyEnrollmentApplicationTableContainer
            currentPersonId={user.personId ?? undefined}
            dataPromise={dataPromise}
            page={page}
            showApplicant={guardianOnly}
            size={size}
            status={status}
          />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
