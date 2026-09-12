import type { Metadata } from "next";
import { Suspense } from "react";
import { ClipboardListIcon } from "lucide-react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { EnrollmentApplicationFilters } from "@features/enrollment-applications/components/enrollment-application-filters";
import { EnrollmentApplicationTableContainer } from "@features/enrollment-applications/components/enrollment-application-table";
import { EnrollmentApplicationTableSkeleton } from "@features/enrollment-applications/components/enrollment-application-table-skeleton";
import { fetchEnrollmentApplications } from "@features/enrollment-applications/services/enrollment-application.service";
import { fetchTrainingPaths } from "@features/academic/services/academic.service";
import {
  parseEnrollmentApplicationPaginationParams,
  type EnrollmentApplicationSearchParams,
} from "@features/enrollment-applications/utils/enrollment-application-pagination.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Solicitudes de inscripción");
}

export default async function EnrollmentApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<EnrollmentApplicationSearchParams>;
}): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_READ)) {
    return <InstitutionalAccessDenied description="No tenés permisos para gestionar solicitudes de inscripción." />;
  }

  const resolvedSearchParams = await searchParams;
  const { page, size, status, trainingPathId, open } = parseEnrollmentApplicationPaginationParams(resolvedSearchParams);
  const dataPromise = fetchEnrollmentApplications(user.institutionId, { page, size, status, trainingPathId, open });
  const { items: trainingPaths } = await fetchTrainingPaths("institutional", user.institutionId, {
    active: true,
    size: 100,
    sort: "name,asc",
  });

  return (
    <PlatformPageShell
      title="Solicitudes de inscripción"
      breadcrumb={<InstitutionalBreadcrumb />}
      actions={<PlatformPageIcon icon={ClipboardListIcon} />}
    >
      <DataTableNavigationProvider>
        <EnrollmentApplicationFilters status={status} trainingPathId={trainingPathId} open={open} trainingPaths={trainingPaths} size={size} />
        <Suspense fallback={<EnrollmentApplicationTableSkeleton />}>
          <EnrollmentApplicationTableContainer
            page={page}
            size={size}
            status={status}
            dataPromise={dataPromise}
            canApprove={hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_APPROVE)}
            canReject={hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_REJECT)}
          />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
