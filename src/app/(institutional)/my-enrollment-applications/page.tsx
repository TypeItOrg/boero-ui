import type { Metadata } from "next";
import { Suspense } from "react";
import { ClipboardListIcon } from "lucide-react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { EnrollmentApplicantSelector } from "@features/enrollment-applications/components/enrollment-applicant-selector";
import { EnrollmentApplicationFilters } from "@features/enrollment-applications/components/enrollment-application-filters";
import { EnrollmentApplicationTableSkeleton } from "@features/enrollment-applications/components/enrollment-application-table-skeleton";
import { MyEnrollmentApplicationTableContainer } from "@features/enrollment-applications/components/my-enrollment-application-table";
import { fetchMyEnrollmentApplications } from "@features/enrollment-applications/services/enrollment-application.service";
import {
  parseEnrollmentApplicationPaginationParams,
  type EnrollmentApplicationSearchParams,
} from "@features/enrollment-applications/utils/enrollment-application-pagination.util";
import { fetchGuardianDependents } from "@features/guardian-dependents/services/guardian-dependent.service";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { canManageDependents, canViewOwnEnrollmentApplications } from "@features/institutional-auth/utils/institutional-applicant-role.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Mis inscripciones");
}

export default async function MyEnrollmentApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<EnrollmentApplicationSearchParams & { dependentPersonId?: string }>;
}): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!canViewOwnEnrollmentApplications(user)) {
    return <InstitutionalAccessDenied description="No tenés inscripciones como postulante." />;
  }

  const resolvedSearchParams = await searchParams;
  const { page, size, status } = parseEnrollmentApplicationPaginationParams(resolvedSearchParams);
  const isGuardian = canManageDependents(user);
  const dependents = isGuardian ? await fetchGuardianDependents(user.institutionId) : [];
  // dependentPersonId comes from the URL: only honor it when it belongs to one of this guardian's dependents.
  const selectedDependent = dependents.find((item) => item.dependentPersonId === resolvedSearchParams.dependentPersonId);
  const dataPromise = fetchMyEnrollmentApplications(user.institutionId, {
    page,
    size,
    status,
    dependentPersonId: selectedDependent?.dependentPersonId,
  });

  return (
    <PlatformPageShell title="Mis inscripciones" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={ClipboardListIcon} />}>
      <EnrollmentApplicantSelector
        allLabel="Todas"
        basePath="/my-enrollment-applications"
        dependents={dependents.map((item) => ({ id: item.dependentPersonId, name: `${item.firstName} ${item.lastName}` }))}
        paramName="dependentPersonId"
        selectedId={selectedDependent?.dependentPersonId}
      />
      <DataTableNavigationProvider>
        <EnrollmentApplicationFilters status={status} size={size} />
        <Suspense fallback={<EnrollmentApplicationTableSkeleton />}>
          <MyEnrollmentApplicationTableContainer
            currentPersonId={user.personId ?? undefined}
            dataPromise={dataPromise}
            page={page}
            showApplicant={isGuardian}
            size={size}
            status={status}
          />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
