import { Suspense, type ReactElement } from "react";

import type { Metadata } from "next";

import { ClipboardListIcon } from "lucide-react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";

import { fetchTrainingPaths } from "@features/academic/services/academic.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentApplicationFilters } from "@features/enrollment-applications/components/enrollment-application-filters";
import { EnrollmentApplicationTableContainer } from "@features/enrollment-applications/components/enrollment-application-table";
import { EnrollmentApplicationTableSkeleton } from "@features/enrollment-applications/components/enrollment-application-table-skeleton";
import { fetchPlatformEnrollmentApplications } from "@features/enrollment-applications/services/enrollment-application.service";
import {
  parseEnrollmentApplicationPaginationParams,
  type EnrollmentApplicationSearchParams,
} from "@features/enrollment-applications/utils/enrollment-application-pagination.util";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata: Metadata = { title: "Solicitudes de inscripción" };

export default async function PlatformEnrollmentApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<EnrollmentApplicationSearchParams>;
}): Promise<ReactElement> {
  const resolvedSearchParams = await searchParams;
  const { page, size, status, trainingPathId, open, pendingDocuments } = parseEnrollmentApplicationPaginationParams(resolvedSearchParams);
  const dataPromise = fetchPlatformEnrollmentApplications({
    page,
    size,
    status,
    trainingPathId,
    open,
    pendingDocuments,
  });
  const { items: trainingPaths } = await fetchTrainingPaths(AcademicScope.ADMIN, undefined, {
    active: true,
    size: 100,
    sort: "name,asc",
  });

  return (
    <PlatformPageShell title="Solicitudes de inscripción" breadcrumb={<PlatformBreadcrumb />} actions={<PlatformPageIcon icon={ClipboardListIcon} />}>
      <DataTableNavigationProvider>
        <EnrollmentApplicationFilters
          status={status}
          trainingPathId={trainingPathId}
          open={open}
          pendingDocuments={pendingDocuments}
          canFilterDocuments={true}
          trainingPaths={trainingPaths}
          size={size}
        />
        <Suspense fallback={<EnrollmentApplicationTableSkeleton />}>
          <EnrollmentApplicationTableContainer
            page={page}
            size={size}
            status={status}
            hasFilters={Boolean(status || trainingPathId || open || pendingDocuments)}
            dataPromise={dataPromise}
            canApprove
            canReject
            scope={AcademicScope.ADMIN}
          />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
