import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarRangeIcon } from "lucide-react";

import { listEnrollmentPeriods } from "@features/enrollment-periods/services/enrollment-period.service";
import { parseEnrollmentPeriodPaginationParams } from "@features/enrollment-periods/utils/enrollment-period-pagination.util";
import { fetchAcademicYear } from "@features/academic/services/academic.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentPeriodsTable } from "@features/enrollment-periods/components/EnrollmentPeriodsTable";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata: Metadata = {
  title: "Períodos de Inscripción",
  description: "Gestión de períodos de inscripción anuales de la institución",
};

interface Props {
  searchParams: Promise<{
    academicYearId?: string;
    status?: string;
    search?: string;
    page?: string;
    size?: string;
  }>;
}

export default async function EnrollmentPeriodsPage({ searchParams }: Props) {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_READ)) {
    return <InstitutionalAccessDenied description="No tenés permisos para administrar los períodos de inscripción." />;
  }

  const params = parseEnrollmentPeriodPaginationParams(await searchParams);
  const [periodsData, selectedAcademicYear] = await Promise.all([
    listEnrollmentPeriods(user.institutionId, params),
    params.academicYearId ? fetchAcademicYear(AcademicScope.INSTITUTIONAL, user.institutionId, params.academicYearId) : null,
  ]);

  const canCreate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_CREATE);
  const canUpdate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_UPDATE);
  const canChangeStatus = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_STATUS_UPDATE);
  const canDelete = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_DELETE);

  return (
    <PlatformPageShell
      title="Períodos de Inscripción"
      breadcrumb={<InstitutionalBreadcrumb />}
      actions={<PlatformPageIcon icon={CalendarRangeIcon} />}
    >
      <main className="flex-1 space-y-6">
        <Suspense fallback={<div className="text-muted-foreground p-4 text-center text-sm">Cargando...</div>}>
          <EnrollmentPeriodsTable
            institutionId={user.institutionId}
            data={periodsData}
            selectedAcademicYear={selectedAcademicYear}
            search={params.search}
            status={params.status}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canChangeStatus={canChangeStatus}
            canDelete={canDelete}
          />
        </Suspense>
      </main>
    </PlatformPageShell>
  );
}
